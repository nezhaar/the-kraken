import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

const partiesP4 = new Map();

function initGrilleP4() {
  return Array.from({ length: 6 }, () => Array(7).fill(0));
}

function grilleToText(grille) {
  const map = { 0: '⚪', 1: '🔴', 2: '🟡' };
  return grille.map(line => line.map(cell => map[cell]).join(' ')).join('\n');
}

function buildButtonsP4(disabledCols = []) {
  const row = new ActionRowBuilder();
  for (let c = 0; c < 7; c++) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`p4_col_${c}`)
        .setLabel((c + 1).toString())
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabledCols.includes(c))
    );
  }
  return row;
}

function checkAlignement(grille, player) {
  const L = 6, C = 7;
  for (let r = 0; r < L; r++) {
    for (let c = 0; c < C; c++) {
      if (grille[r][c] !== player) continue;
      
      if (c + 3 < C &&
        grille[r][c + 1] === player &&
        grille[r][c + 2] === player &&
        grille[r][c + 3] === player) {
        return true;
      }
      
      if (r + 3 < L &&
        grille[r + 1][c] === player &&
        grille[r + 2][c] === player &&
        grille[r + 3][c] === player) {
        return true;
      }
      
      if (r + 3 < L && c + 3 < C &&
        grille[r + 1][c + 1] === player &&
        grille[r + 2][c + 2] === player &&
        grille[r + 3][c + 3] === player) {
        return true;
      }
      
      if (r - 3 >= 0 && c + 3 < C &&
        grille[r - 1][c + 1] === player &&
        grille[r - 2][c + 2] === player &&
        grille[r - 3][c + 3] === player) {
        return true;
      }
    }
  }
  return false;
}

function findFirstFreeRow(grille, col) {
  for (let r = 5; r >= 0; r--) {
    if (grille[r][col] === 0) return r;
  }
  return -1;
}

function randomMoveP4(grille) {
  const libres = [];
  for (let c = 0; c < 7; c++) {
    if (grille[0][c] === 0) {
      libres.push(c);
    }
  }
  if (libres.length === 0) return null;
  return libres[Math.floor(Math.random() * libres.length)];
}

export const data = new SlashCommandBuilder()
  .setName('puissance4')
  .setDescription('Jouez à Puissance 4 contre le bot ou défiez un·e ami·e.')
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
    const grille = initGrilleP4();
    const partie = {
      grille,
      joueurR: challengerId, 
      joueurY: 'bot',        
      tour: 1,              
    };
    const embed = new EmbedBuilder()
      .setTitle('🟠⚫ Puissance 4 • Vous vs Bot')
      .setDescription(`C’est à <@${challengerId}> (🔴) de jouer.\n\n${grilleToText(grille)}`)
      .setColor(0x5865f2);

    const btnRow = buildButtonsP4();
    const msg = await interaction.reply({ embeds: [embed], components: [btnRow], fetchReply: true });
    partiesP4.set(msg.id, partie);
    return;
  }

  if (adversaire.id === challengerId) {
    return interaction.reply({ content: '👀 Vous ne pouvez pas jouer contre vous-même !', ephemeral: true });
  }

  const embedDefi = new EmbedBuilder()
    .setTitle('🤜‍🤛 Défi Puissance 4')
    .setDescription(`<@${challengerId}> vous défie à une partie de Puissance 4 !\nCliquez sur **Accepter** pour commencer, ou **Refuser** pour annuler.`)
    .setColor(0xffb86c);

  const rowDefi = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`p4_defi_accepter_${challengerId}_${adversaire.id}`)
      .setLabel('Accepter')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`p4_defi_refuser_${challengerId}_${adversaire.id}`)
      .setLabel('Refuser')
      .setStyle(ButtonStyle.Danger)
  );
  await interaction.reply({ embeds: [embedDefi], components: [rowDefi] });
}

export async function handleP4Component(interaction) {
  if (!interaction.isButton()) return;
  const custom = interaction.customId.split('_');
  if (custom[0] === 'p4' && custom[1] === 'defi') {
    const action = custom[2];          
    const challengerId = custom[3];
    const adversaireId = custom[4];
    if (interaction.user.id !== adversaireId) {
      return interaction.reply({ content: '⛔ Ce bouton ne vous est pas destiné.', ephemeral: true });
    }
    if (action === 'refuser') {
      const embedRefuse = new EmbedBuilder()
        .setTitle('❌ Défi Puissance 4 refusé')
        .setDescription(`<@${adversaireId}> a refusé le défi de <@${challengerId}>.`)
        .setColor(0xed4245);
      return interaction.update({ embeds: [embedRefuse], components: [] });
    }
    const embedAccept = new EmbedBuilder()
      .setTitle('✅ Défi Puissance 4 accepté')
      .setDescription(`Partie en cours : <@${challengerId}> (🔴) vs <@${adversaireId}> (🟡).`)
      .setColor(0x57f287);
    await interaction.update({ embeds: [embedAccept], components: [] });

    const grille = initGrilleP4();
    const partie = {
      grille,
      joueurR: challengerId,
      joueurY: adversaireId,
      tour: 1,
    };
    const embedJeu = new EmbedBuilder()
      .setTitle('🟠⚫ Puissance 4 • Duel Humain')
      .setDescription(`C’est à <@${challengerId}> (🔴) de jouer.\n\n${grilleToText(grille)}`)
      .setColor(0x5865f2);

    const btnRow = buildButtonsP4();
    const msgJeu = await interaction.followUp({ embeds: [embedJeu], components: [btnRow], fetchReply: true });
    partiesP4.set(msgJeu.id, partie);
    return;
  }

  if (custom[0] === 'p4' && custom[1] === 'col') {
    const msgId = interaction.message.id;
    const partie = partiesP4.get(msgId);
    if (!partie) return;
    const col = parseInt(custom[2], 10);
    const currentPlayer = partie.tour === 1 ? partie.joueurR : partie.joueurY;
    if (interaction.user.id !== currentPlayer) {
      return interaction.reply({ content: '⛔ Ce n’est pas à vous de jouer.', ephemeral: true });
    }
    const lineFree = findFirstFreeRow(partie.grille, col);
    if (lineFree < 0) {
      return interaction.reply({ content: '🚫 Cette colonne est pleine.', ephemeral: true });
    }
    partie.grille[lineFree][col] = partie.tour;

    const won = checkAlignement(partie.grille, partie.tour);
    const full = partie.grille.every(row => row.every(cell => cell !== 0));

    if (partie.joueurY === 'bot' && !won && !full && partie.tour === 1) {
      const embedWait = new EmbedBuilder()
        .setTitle('🟠⚫ Puissance 4 • Vous vs Bot')
        .setDescription(`🔴 <@${partie.joueurR}> a joué en colonne **${col + 1}**. Le bot réfléchit…`)
        .setColor(0x5865f2)
        .addFields({ name: 'Grille', value: grilleToText(partie.grille) });

      const tempRow = buildButtonsP4();
      tempRow.components.forEach(b => b.setDisabled(true));

      await interaction.update({ embeds: [embedWait], components: [tempRow] });

      setTimeout(async () => {
        const moveBot = randomMoveP4(partie.grille);
        if (moveBot !== null) {
          const rowBot = findFirstFreeRow(partie.grille, moveBot);
          partie.grille[rowBot][moveBot] = 2; // jeton jaune
        }
        const botWon = checkAlignement(partie.grille, 2);
        const fullAfter = partie.grille.every(row => row.every(cell => cell !== 0));
        let descFin, colorFin;

        if (botWon) {
          descFin = `🏆 Le bot (🟡) a gagné !`;
          colorFin = 0xed4245;
        } else if (fullAfter) {
          descFin = '🤝 Égalité !';
          colorFin = 0x5865f2;
        } else {
          partie.tour = 1; 
          descFin = `C'est à <@${partie.joueurR}> (🔴) de jouer.`;
          colorFin = 0x5865f2;
        }

        const embedMaj = new EmbedBuilder()
          .setTitle('🟠⚫ Puissance 4 • Vous vs Bot')
          .setDescription(`${descFin}\n\n${grilleToText(partie.grille)}`)
          .setColor(colorFin);

        let newRow = buildButtonsP4();
        if (botWon || fullAfter) {
          const off = buildButtonsP4();
          off.components.forEach(b => b.setDisabled(true));
          partiesP4.delete(msgId);
          return await interaction.editReply({ embeds: [embedMaj], components: [off] });
        }

        return await interaction.editReply({ embeds: [embedMaj], components: [newRow] });
      }, 1000);

      return;
    }

    if (won || full) {
      let descFin, colorFin;
      if (won) {
        const winnerId = partie.tour === 1
          ? partie.joueurR
          : partie.joueurY === 'bot' ? 'bot' : partie.joueurY;
        descFin = winnerId === 'bot'
          ? '🏆 Le bot (🟡) a gagné !'
          : `🏆 <@${winnerId}> a gagné !`;
        colorFin = winnerId === 'bot' ? 0xed4245 : 0x57f287;
      } else {
        descFin = '🤝 Égalité !';
        colorFin = 0x5865f2;
      }

      const embedFin = new EmbedBuilder()
        .setTitle('🟠⚫ Puissance 4 • Fin de partie')
        .setDescription(`${descFin}\n\n${grilleToText(partie.grille)}`)
        .setColor(colorFin);

      const rowOff = buildButtonsP4();
      rowOff.components.forEach(b => b.setDisabled(true));
      partiesP4.delete(msgId);
      return interaction.update({ embeds: [embedFin], components: [rowOff] });
    }

    partie.tour = partie.tour === 1 ? 2 : 1;
    const prochainJoueur = partie.tour === 1 ? partie.joueurR : partie.joueurY;
    const couleur = partie.tour === 1 ? '🔴' : '🟡';
    const embedNext = new EmbedBuilder()
      .setTitle('🟠⚫ Puissance 4 • Duel Humain')
      .setDescription(`C’est à <@${prochainJoueur}> (${couleur}) de jouer.\n\n${grilleToText(partie.grille)}`)
      .setColor(0x5865f2);

    const rowNext = buildButtonsP4();
    return interaction.update({ embeds: [embedNext], components: [rowNext] });
  }
}
