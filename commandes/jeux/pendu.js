import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

const DICO = [
  'discord',
  'programmation',
  'javascript',
  'ordinateur',
  'algorithme',
  'developpeur',
  'serveur',
  'programmation',
  'python',
  'hangman',
];

const partiesPendu = new Map();

function motAleatoire() {
  return DICO[Math.floor(Math.random() * DICO.length)];
}

function buildMaskedWord(mot, lettresTrouvees) {
  return mot
    .split('')
    .map(l => (lettresTrouvees.has(l) ? l : '‒'))
    .join(' ');
}

function buildAlphabetButtons(lettresJouees) {
  const rows = [];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 26; i += 7) {
    const row = new ActionRowBuilder();
    for (let j = i; j < i + 7 && j < 26; j++) {
      const lettre = alphabet[j];
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`pendu_${lettre}`)
          .setLabel(lettre)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(lettresJouees.has(lettre.toLowerCase()))
      );
    }
    rows.push(row);
  }
  return rows;
}

export const data = new SlashCommandBuilder()
  .setName('pendu')
  .setDescription('Jouez au Pendu contre le bot ou défiez un·e ami·e.')
  .addUserOption(opt =>
    opt
      .setName('adversaire')
      .setDescription('Mentionnez un·e ami·e pour jouer en duel. Laissez vide pour jouer contre le bot.')
      .setRequired(false)
  );

export async function execute(interaction) {
  const challengerId = interaction.user.id;
  const adversaire = interaction.options.getUser('adversaire');

  if (!adversaire) {
    const mot = motAleatoire().toLowerCase();
    const joueurs = [challengerId, 'bot'];
    
    const partie = {
      mot,
      lettresTrouvees: new Set(),
      lettresJouees: new Set(),
      essaisRestants: 6,
      tour: challengerId, 
    };
    const masked = buildMaskedWord(mot, partie.lettresTrouvees);
    const embed = new EmbedBuilder()
      .setTitle('🪓 Pendu • Vous vs Bot')
      .setDescription(`Mot : \`${masked}\`\nEssais restants : **${partie.essaisRestants}**`)
      .setColor(0x5865f2);

    const alphaRows = buildAlphabetButtons(partie.lettresJouees);
    const msg = await interaction.reply({ embeds: [embed], components: alphaRows, fetchReply: true });
    partiesPendu.set(msg.id, partie);
    return;
  }

  if (adversaire.id === challengerId) {
    return interaction.reply({ content: '👀 Vous ne pouvez pas jouer contre vous-même !', ephemeral: true });
  }

  const embedDefi = new EmbedBuilder()
    .setTitle('🪓 Défi Pendu')
    .setDescription(`<@${challengerId}> vous défie au Pendu !\nCliquez sur **Accepter** pour jouer, ou **Refuser** pour annuler.`)
    .setColor(0xffb86c);

  const rowDefi = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`pendu_defi_accepter_${challengerId}_${adversaire.id}`)
      .setLabel('Accepter')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`pendu_defi_refuser_${challengerId}_${adversaire.id}`)
      .setLabel('Refuser')
      .setStyle(ButtonStyle.Danger)
  );
  await interaction.reply({ embeds: [embedDefi], components: [rowDefi] });
}

export async function handlePenduComponent(interaction) {
  if (!interaction.isButton()) return;
  const custom = interaction.customId.split('_');

  if (custom[0] === 'pendu' && custom[1] === 'defi') {
    const action = custom[2];          
    const challengerId = custom[3];
    const adversaireId = custom[4];
    if (interaction.user.id !== adversaireId) {
      return interaction.reply({ content: '⛔ Ce bouton ne vous est pas destiné.', ephemeral: true });
    }
    if (action === 'refuser') {
      const embedRefuse = new EmbedBuilder()
        .setTitle('❌ Défi Pendu refusé')
        .setDescription(`<@${adversaireId}> a refusé le défi de <@${challengerId}>.`)
        .setColor(0xed4245);
      return interaction.update({ embeds: [embedRefuse], components: [] });
    }
    const embedAccept = new EmbedBuilder()
      .setTitle('✅ Défi Pendu accepté')
      .setDescription(`La partie peut commencer : <@${challengerId}> vs <@${adversaireId}>.`)
      .setColor(0x57f287);
    await interaction.update({ embeds: [embedAccept], components: [] });

    const mot = motAleatoire().toLowerCase();
    const partie = {
      mot,
      lettresTrouvees: new Set(),
      lettresJouees: new Set(),
      essaisRestants: 6,
      tour: challengerId,
      joueurX: challengerId,
      joueurO: adversaireId,
    };
    const masked = buildMaskedWord(mot, partie.lettresTrouvees);
    const embedJeu = new EmbedBuilder()
      .setTitle('🪓 Pendu • Duel Humain')
      .setDescription(`Mot : \`${masked}\`\nEssais restants : **${partie.essaisRestants}**\nC’est à <@${partie.tour}> de jouer.`)
      .setColor(0x5865f2);

    const alphaRows = buildAlphabetButtons(partie.lettresJouees);
    const msgJeu = await interaction.followUp({ embeds: [embedJeu], components: alphaRows, fetchReply: true });
    partiesPendu.set(msgJeu.id, partie);
    return;
  }

  if (custom[0] === 'pendu' && custom[1] !== 'defi') {
    const lettre = custom[1].toLowerCase();
    const msgId = interaction.message.id;
    const partie = partiesPendu.get(msgId);
    if (!partie) return;

    if (partie.joueurX && partie.joueurO) {
      if (interaction.user.id !== partie.tour) {
        return interaction.reply({ content: '⛔ Ce n’est pas à vous de jouer.', ephemeral: true });
      }
    }

    if (partie.lettresJouees.has(lettre)) {
      return interaction.reply({ content: '❌ Lettre déjà jouée !', ephemeral: true });
    }
    partie.lettresJouees.add(lettre);

    if (!partie.mot.includes(lettre)) {
      partie.essaisRestants--;
    } else {
      partie.lettresTrouvees.add(lettre);
    }

    const masked = buildMaskedWord(partie.mot, partie.lettresTrouvees);
    const aGagne = !masked.includes('‒');
    const aPerdu = partie.essaisRestants <= 0 && !aGagne;

    let embedNew = new EmbedBuilder()
      .setTitle(partie.joueurX && partie.joueurO ? '🪓 Pendu • Duel Humain' : '🪓 Pendu • Vous vs Bot')
      .setColor(aGagne ? 0x57f287 : aPerdu ? 0xed4245 : 0x5865f2);

    if (aGagne) {
      embedNew.setDescription(`✅ <@${interaction.user.id}> a trouvé le mot : \`${partie.mot}\` !`);
    } else if (aPerdu) {
      embedNew.setDescription(`💀 Partie terminée. Le mot était : \`${partie.mot}\`.`);
    } else {
      if (partie.joueurX && partie.joueurO) {
        partie.tour = partie.tour === partie.joueurX ? partie.joueurO : partie.joueurX;
        embedNew.setDescription(`Mot : \`${masked}\`\nEssais restants : **${partie.essaisRestants}**\nC’est à <@${partie.tour}> de jouer.`);
      } else {
        embedNew.setDescription(`Mot : \`${masked}\`\nEssais restants : **${partie.essaisRestants}**`);
      }
    }

    let newRows;
    if (aGagne || aPerdu) {
      const offRows = buildAlphabetButtons(partie.lettresJouees);
      offRows.forEach(r => r.components.forEach(b => b.setDisabled(true)));
      newRows = offRows;
      partiesPendu.delete(msgId);
      return interaction.update({ embeds: [embedNew], components: newRows });
    } else {
      newRows = buildAlphabetButtons(partie.lettresJouees);
      return interaction.update({ embeds: [embedNew], components: newRows });
    }
  }
}
