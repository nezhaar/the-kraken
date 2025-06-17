import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

const partiesMorpion = new Map();


function buildGrille(grilleState) {
  const rows = [];
  for (let line = 0; line < 3; line++) {
    const actionRow = new ActionRowBuilder();
    for (let col = 0; col < 3; col++) {
      const idx = line * 3 + col;
      const val = grilleState[idx]; // '' ou 'X' ou 'O'
      actionRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`morpion_case_${idx}`)
          .setLabel(val || '‌') 
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(Boolean(val))
      );
    }
    rows.push(actionRow);
  }
  return rows;
}

function checkVictory(grilleState) {
  const linesToCheck = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of linesToCheck) {
    if (
      grilleState[a] &&
      grilleState[a] === grilleState[b] &&
      grilleState[a] === grilleState[c]
    ) {
      return grilleState[a]; // 'X' ou 'O'
    }
  }
  return null;
}

function randomEmptyCase(grilleState) {
  const libres = grilleState
    .map((v, i) => (v === '' ? i : null))
    .filter(i => i !== null);
  if (libres.length === 0) return null;
  return libres[Math.floor(Math.random() * libres.length)];
}

export const data = new SlashCommandBuilder()
  .setName('morpion')
  .setDescription('Jouez au Morpion contre le bot ou défiez un·e ami·e.')
  .addUserOption(opt =>
    opt
      .setName('adversaire')
      .setDescription('Mentionnez un·e ami·e pour jouer en tête-à-tête. Laissez vide pour jouer contre le bot.')
      .setRequired(false)
  );

export async function execute(interaction) {
  const challengerId = interaction.user.id;
  const adversaire = interaction.options.getUser('adversaire');

  if (!adversaire) {
    const grilleVide = Array(9).fill('');
    const partie = {
      grille: grilleVide,
      joueurX: challengerId,
      joueurO: 'bot',
      tour: 'X',
    };

    const embed = new EmbedBuilder()
      .setTitle('🎮 Morpion • Vous vs le Bot')
      .setDescription(`C’est à <@${challengerId}> (X) de jouer.`)
      .setColor(0x5865f2);

    const components = buildGrille(grilleVide);
    const msg = await interaction.reply({ embeds: [embed], components, fetchReply: true });

    partiesMorpion.set(msg.id, partie);
    return;
  }

  if (adversaire.id === challengerId) {
    return interaction.reply({ content: '👀 Vous ne pouvez pas jouer contre vous-même !', ephemeral: true });
  }

  const embedDefi = new EmbedBuilder()
    .setTitle('🤜‍🤛 Défi Morpion')
    .setDescription(
      `<@${challengerId}> vous défie au Morpion !  \n` +
      `Cliquez sur **Accepter** pour jouer, ou **Refuser** pour annuler.`
    )
    .setColor(0xffb86c);

  const rowDefi = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`morpion_defi_accepter_${challengerId}_${adversaire.id}`)
      .setLabel('Accepter')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`morpion_defi_refuser_${challengerId}_${adversaire.id}`)
      .setLabel('Refuser')
      .setStyle(ButtonStyle.Danger)
  );

  await interaction.reply({ embeds: [embedDefi], components: [rowDefi] });
}

export async function handleMorpionComponent(interaction) {
  if (interaction.isButton() && interaction.customId.startsWith('morpion_defi_')) {
    const [_, __, action, challengerId, adversaireId] = interaction.customId.split('_');
    if (interaction.user.id !== adversaireId) {
      return interaction.reply({ content: '⛔ Ce bouton ne vous est pas destiné.', ephemeral: true });
    }
    if (action === 'refuser') {
      const embedRefuse = new EmbedBuilder()
        .setTitle('❌ Défi Morpion refusé')
        .setDescription(`<@${adversaireId}> a refusé le défi de <@${challengerId}>.`)
        .setColor(0xed4245);
      return interaction.update({ embeds: [embedRefuse], components: [] });
    }
    const embedAccept = new EmbedBuilder()
      .setTitle('✅ Défi Morpion accepté')
      .setDescription(`La partie commence : <@${challengerId}> (X) vs <@${adversaireId}> (O).`)
      .setColor(0x57f287);
    await interaction.update({ embeds: [embedAccept], components: [] });

    const grilleVide = Array(9).fill('');
    const partie = {
      grille: grilleVide,
      joueurX: challengerId,
      joueurO: adversaireId,
      tour: 'X',
    };

    const embedJeu = new EmbedBuilder()
      .setTitle('🎮 Morpion • Duel Humain')
      .setDescription(`C’est à <@${challengerId}> (X) de jouer.`)
      .setColor(0x5865f2);

    const components = buildGrille(grilleVide);
    const msgJeu = await interaction.followUp({ embeds: [embedJeu], components, fetchReply: true });
    partiesMorpion.set(msgJeu.id, partie);
    return;
  }

  if (interaction.isButton() && interaction.customId.startsWith('morpion_case_')) {
    const msgId = interaction.message.id;
    const idx = parseInt(interaction.customId.split('_')[2], 10);
    const partie = partiesMorpion.get(msgId);
    if (!partie) return; // partie absente

    const currentPlayerId = partie.tour === 'X' ? partie.joueurX : partie.joueurO;
    if (interaction.user.id !== currentPlayerId) {
      return interaction.reply({ content: '⛔ Ce n’est pas à vous de jouer.', ephemeral: true });
    }

    partie.grille[idx] = partie.tour;

    const gagnant = checkVictory(partie.grille);
    const plein = partie.grille.every(cell => cell !== '');

    if (partie.joueurO === 'bot' && !gagnant && !plein) {
      setTimeout(async () => {
        const choixBot = randomEmptyCase(partie.grille);
        if (choixBot !== null) {
          partie.grille[choixBot] = 'O';
        }
        const gagnantBot = checkVictory(partie.grille);
        const pleinBot = partie.grille.every(cell => cell !== '');

        let desc, color;
        if (gagnantBot) {
          desc = `🏆 Le bot (O) a gagné !`;
          color = 0xed4245;
        } else if (pleinBot) {
          desc = '🤝 Égalité !';
          color = 0x5865f2;
        } else {
          partie.tour = 'X';
          desc = `C’est à <@${partie.joueurX}> (X) de jouer.`;
          color = 0x5865f2;
        }

        const embedMaj = new EmbedBuilder()
          .setTitle('🎮 Morpion • Vous vs Bot')
          .setDescription(desc)
          .setColor(color)
          .addFields({ name: 'Grille', value: partie.grille
            .map((v, i) => v || '‌') 
            .reduce((acc, cur, i) => (i % 3 === 2 ? acc + cur + '\n' : acc + cur), '')
          });

        const newComponents = buildGrille(partie.grille);

        if (gagnantBot || pleinBot) {
          const rowsOff = newComponents.map(row =>
            ActionRowBuilder.from(row).setComponents(
              ...row.components.map(btn => ButtonBuilder.from(btn).setDisabled(true))
            )
          );
          partiesMorpion.delete(msgId);
          return interaction.update({ embeds: [embedMaj], components: rowsOff });
        }

        return interaction.update({ embeds: [embedMaj], components: newComponents });
      }, 1000);

      const tempRows = buildGrille(partie.grille).map(row =>
        ActionRowBuilder.from(row).setComponents(
          ...row.components.map(btn => ButtonBuilder.from(btn).setDisabled(true))
        )
      );
      return interaction.update({ components: tempRows });
    }

    if (gagnant || plein) {
      let desc, color;
      if (gagnant) {
        desc = `🏆 <@${gagnant === 'X' ? partie.joueurX : partie.joueurO}> a gagné !`;
        color = 0x57f287;
      } else {
        desc = '🤝 Égalité !';
        color = 0x5865f2;
      }

      const embedFin = new EmbedBuilder()
        .setTitle('🎮 Morpion • Fin de partie')
        .setDescription(desc)
        .setColor(color)
        .addFields({ name: 'Grille', value: partie.grille
          .map((v, i) => v || '‌')
          .reduce((acc, cur, i) => (i % 3 === 2 ? acc + cur + '\n' : acc + cur), '')
        });

      const rowsOff = buildGrille(partie.grille).map(row =>
        ActionRowBuilder.from(row).setComponents(
          ...row.components.map(btn => ButtonBuilder.from(btn).setDisabled(true))
        )
      );
      partiesMorpion.delete(msgId);
      return interaction.update({ embeds: [embedFin], components: rowsOff });
    }

    partie.tour = partie.tour === 'X' ? 'O' : 'X';
    const prochain = partie.tour === 'X' ? partie.joueurX : partie.joueurO;
    const embedNext = new EmbedBuilder()
      .setTitle(partie.joueurO === 'bot' ? '🎮 Morpion • Vous vs le Bot' : '🎮 Morpion • Duel Humain')
      .setDescription(`C’est à <@${prochain}> (${partie.tour}) de jouer.`)
      .setColor(0x5865f2)
      .addFields({ name: 'Grille', value: partie.grille
        .map((v, i) => v || '‌')
        .reduce((acc, cur, i) => (i % 3 === 2 ? acc + cur + '\n' : acc + cur), '')
      });

    const newComp = buildGrille(partie.grille);
    return interaction.update({ embeds: [embedNext], components: newComp });
  }

}
