import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

const duelsChifumi = new Map();

const EMOJI = {
  pierre: '🪨',
  feuille: '📄',
  ciseaux: '✂️',
};

export const data = new SlashCommandBuilder()
  .setName('chifumi')
  .setDescription('Joue au Pierre-Feuille-Ciseaux contre le bot ou défie un·e ami·e.')
  .addUserOption(opt =>
    opt
      .setName('adversaire')
      .setDescription('Mentionnez un·e ami·e pour le défier. Laissez vide pour jouer contre le bot.')
      .setRequired(false)
  )
  .addStringOption(opt =>
    opt
      .setName('choix')
      .setDescription('Votre coup : pierre, feuille ou ciseaux. (Ignoré si vous défiez quelqu’un)')
      .addChoices(
        { name: 'Pierre 🪨', value: 'pierre' },
        { name: 'Feuille 📄', value: 'feuille' },
        { name: 'Ciseaux ✂️', value: 'ciseaux' }
      )
      .setRequired(false)
  );

export async function execute(interaction) {
  const challengerId = interaction.user.id;
  const adversaire = interaction.options.getUser('adversaire');
  const choixInitial = interaction.options.getString('choix');

  if (!adversaire) {
    if (!choixInitial) {
      return interaction.reply({ content: '❌ Vous devez choisir `pierre`, `feuille` ou `ciseaux` si vous jouez contre moi !', ephemeral: true });
    }
    const options = ['pierre', 'feuille', 'ciseaux'];
    const botCoup = options[Math.floor(Math.random() * 3)];
    const userCoup = choixInitial;

    let resultatTexte;
    if (userCoup === botCoup) {
      resultatTexte = "Égalité ! 🤝";
    } else if (
      (userCoup === 'pierre' && botCoup === 'ciseaux') ||
      (userCoup === 'feuille' && botCoup === 'pierre') ||
      (userCoup === 'ciseaux' && botCoup === 'feuille')
    ) {
      resultatTexte = "Bravo, vous gagnez ! 🎉";
    } else {
      resultatTexte = "Dommage, vous perdez… 😢";
    }

    const embed = new EmbedBuilder()
      .setTitle('🕹️ Chifumi (vous vs le bot)')
      .setDescription(
        `**Vous** : ${EMOJI[userCoup]}\n**Bot** : ${EMOJI[botCoup]}\n\n**${resultatTexte}**`
      )
      .setColor(
        resultatTexte.includes('gagne') ? 0x57f287 :
        resultatTexte.includes('perdez') ? 0xed4245 :
        0x5865f2
      );
    return interaction.reply({ embeds: [embed] });
  }

  if (adversaire.id === challengerId) {
    return interaction.reply({ content: '👀 Vous ne pouvez pas vous défier vous-même !', ephemeral: true });
  }

  const embedDefi = new EmbedBuilder()
    .setTitle('🤜‍🤛 Défi Chifumi')
    .setDescription(
      `<@${challengerId}> vous défie au Pierre-Feuille-Ciseaux !  \n` +
      `Cliquez sur **Accepter** pour jouer, ou **Refuser** pour annuler.`
    )
    .setColor(0xffb86c);

  const rowDefi = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`chifumi_defi_accepter_${challengerId}_${adversaire.id}`)
      .setLabel('Accepter')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`chifumi_defi_refuser_${challengerId}_${adversaire.id}`)
      .setLabel('Refuser')
      .setStyle(ButtonStyle.Danger)
  );

  await interaction.reply({ embeds: [embedDefi], components: [rowDefi] });
}

export async function handleChifumiComponent(interaction) {
  if (!interaction.isButton()) return;
  const custom = interaction.customId.split('_'); 
  if (custom[0] !== 'chifumi' || custom[1] !== 'defi') return;

  const action = custom[2];           
  const challengerId = custom[3];     
  const adversaireId = custom[4];     

  if (interaction.user.id !== adversaireId) {
    return interaction.reply({ content: '⛔ Ce bouton ne vous est pas destiné.', ephemeral: true });
  }

  if (action === 'refuser') {
    const embedRefuse = new EmbedBuilder()
      .setTitle('❌ Défi annulé')
      .setDescription(`<@${adversaireId}> a refusé le défi de <@${challengerId}>.`)
      .setColor(0xed4245);
    return interaction.update({ embeds: [embedRefuse], components: [] });
  }

  const embedAccept = new EmbedBuilder()
    .setTitle('✅ Défi accepté')
    .setDescription(`Les deux joueurs doivent maintenant choisir leur coup.`)
    .setColor(0x57f287);
  await interaction.update({ embeds: [embedAccept], components: [] });

  const embedJeu = new EmbedBuilder()
    .setTitle('🕹️ Chifumi : Duel Humain')
    .setDescription(`**<@${challengerId}>** vs **<@${adversaireId}>**\n\n` +
      `Cliquez chacun sur votre symbole pour enregistrer votre coup.`
    )
    .setColor(0x5865f2);

  const rowA = new ActionRowBuilder();
  const rowB = new ActionRowBuilder();
  ['pierre', 'feuille', 'ciseaux'].forEach(option => {
    rowA.addComponents(
      new ButtonBuilder()
        .setCustomId(`chifumi_choice_${challengerId}_${option}`)
        .setLabel(EMOJI[option])
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false)
    );
    rowB.addComponents(
      new ButtonBuilder()
        .setCustomId(`chifumi_choice_${adversaireId}_${option}`)
        .setLabel(EMOJI[option])
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(false)
    );
  });

  const msgJeu = await interaction.followUp({ embeds: [embedJeu], components: [rowA, rowB], fetchReply: true });

  duelsChifumi.set(msgJeu.id, {
    joueurA: challengerId,
    joueurB: adversaireId,
    coups: {}  
  });

  const filter = btn => {
    if (!btn.customId.startsWith('chifumi_choice_')) return false;
    const parts = btn.customId.split('_');
    const playerId = parts[2];
    return (playerId === challengerId || playerId === adversaireId) && btn.user.id === playerId;
  };
  const collector = msgJeu.createMessageComponentCollector({ filter, time: 60_000 }); // 60s max

  collector.on('collect', async btn => {
    const info = btn.customId.split('_');
    const playerId = info[2];
    const choix = info[3]; // 'pierre'|'feuille'|'ciseaux'
    const partie = duelsChifumi.get(msgJeu.id);
    if (!partie) return btn.reply({ content: 'Partie introuvable.', ephemeral: true });

    if (partie.coups[playerId]) {
      return btn.reply({ content: 'Vous avez déjà joué votre coup.', ephemeral: true });
    }

    partie.coups[playerId] = choix;

    const nouvellesRows = msgJeu.components.map(row => {
      const newRow = ActionRowBuilder.from(row);
      newRow.components.forEach(comp => {
        if (comp.data.custom_id.startsWith(`chifumi_choice_${playerId}_`)) {
          comp.setDisabled(true);
        }
      });
      return newRow;
    });
    await btn.update({ components: nouvellesRows });

    const coups = Object.keys(partie.coups);
    if (coups.length === 2) {
      collector.stop('both_played');
    }
  });

  collector.on('end', async (_collected, reason) => {
    const partie = duelsChifumi.get(msgJeu.id);
    if (!partie) return;

    let embedFin = new EmbedBuilder().setTitle('🕹️ Résultat du Chifumi').setColor(0x5865f2);
    const coups = partie.coups;
    if (reason === 'time' && ( !coups[ challengerId ] || !coups[ adversaireId ] )) {
      embedFin.setDescription('⏰ Temps écoulé. Pas assez de coups joués. Partie annulée.');
      const rowsOff = msgJeu.components.map(row =>
        ActionRowBuilder.from(row).setComponents(
          ...row.components.map(btn =>
            ButtonBuilder.from(btn).setDisabled(true)
          )
        )
      );
      await msgJeu.edit({ embeds: [embedFin], components: rowsOff });
      duelsChifumi.delete(msgJeu.id);
      return;
    }

    const choixA = coups[challengerId];
    const choixB = coups[adversaireId];
    embedFin.addFields(
      { name: `${EMOJI[choixA]} <@${challengerId}>`, value: '\u200B', inline: true },
      { name: `${EMOJI[choixB]} <@${adversaireId}>`, value: '\u200B', inline: true },
    );

    let verdict;
    if (choixA === choixB) {
      verdict = 'Égalité ! 🤝';
    } else if (
      (choixA === 'pierre' && choixB === 'ciseaux') ||
      (choixA === 'feuille' && choixB === 'pierre') ||
      (choixA === 'ciseaux' && choixB === 'feuille')
    ) {
      verdict = `<@${challengerId}> gagne ! 🎉`;
    } else {
      verdict = `<@${adversaireId}> gagne ! 🎉`;
    }
    embedFin.setDescription(verdict);


    const rowsDisabled = msgJeu.components.map(row =>
      ActionRowBuilder.from(row).setComponents(
        ...row.components.map(btn =>
          ButtonBuilder.from(btn).setDisabled(true)
        )
      )
    );
    await msgJeu.edit({ embeds: [embedFin], components: rowsDisabled });
    duelsChifumi.delete(msgJeu.id);
  });
}
