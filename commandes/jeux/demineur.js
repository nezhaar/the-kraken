import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';

const TAILLE = 5;
const NB_MINES = 5;

const partiesDemineur = new Map();

function genPlateau() {
  const plateau = Array.from({ length: TAILLE }, () => Array(TAILLE).fill(0));
  let placed = 0;
  while (placed < NB_MINES) {
    const r = Math.floor(Math.random() * TAILLE);
    const c = Math.floor(Math.random() * TAILLE);
    if (plateau[r][c] === 0) {
      plateau[r][c] = 1;
      placed++;
    }
  }
  return plateau;
}

function countAdjMines(plateau, r, c) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < TAILLE && nc >= 0 && nc < TAILLE) {
        if (plateau[nr][nc] === 1) count++;
      }
    }
  }
  return count;
}

function plateauToText(plateau, decouvertes) {
  let text = '';
  for (let r = 0; r < TAILLE; r++) {
    for (let c = 0; c < TAILLE; c++) {
      if (decouvertes.has(`${r},${c}`)) {
        if (plateau[r][c] === 1) {
          text += '💣 ';
        } else {
          const n = countAdjMines(plateau, r, c);
          text += `${n} `;
        }
      } else {
        text += '🟦 ';
      }
    }
    text += '\n';
  }
  return text;
}

function buildButtonsDemineur(decouvertes) {
  const rows = [];
  for (let r = 0; r < TAILLE; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < TAILLE; c++) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`demineur_${r}_${c}`)
          .setLabel('  ')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(decouvertes.has(`${r},${c}`))
      );
    }
    rows.push(row);
  }
  return rows;
}

export const data = new SlashCommandBuilder()
  .setName('demineur')
  .setDescription('Jouez au Démineur contre le bot ou défiez un·e ami·e.')
  .addUserOption(opt =>
    opt
      .setName('adversaire')
      .setDescription('Mentionnez un·e ami·e pour jouer en duel (non implémenté, partie solo seulement).')
      .setRequired(false)
  );

export async function execute(interaction) {
  const plateau = genPlateau();
  const decouvertes = new Set();
  const partie = {
    plateau,
    decouvertes,
    perdu: false
  };
  const embed = new EmbedBuilder()
    .setTitle('💥 Démineur')
    .setDescription(`Plateau :\n\`\`\`\n${plateauToText(plateau, decouvertes)}\n\`\`\``)
    .setColor(0x5865f2);

  const btnRows = buildButtonsDemineur(decouvertes);
  const msg = await interaction.reply({ embeds: [embed], components: btnRows, fetchReply: true });
  partiesDemineur.set(msg.id, partie);
}

export async function open(interaction) {
  return execute(interaction);
}

export async function handleDemineurComponent(interaction) {
  if (!interaction.isButton()) return;
  const [_, rStr, cStr] = interaction.customId.split('_');
  const r = parseInt(rStr, 10);
  const c = parseInt(cStr, 10);
  const msgId = interaction.message.id;
  const partie = partiesDemineur.get(msgId);
  if (!partie) return;

  if (partie.perdu) return;

  if (partie.plateau[r][c] === 1) {
    partie.perdu = true;
    partie.decouvertes.add(`${r},${c}`);
    const embed = new EmbedBuilder()
      .setTitle('💥 Démineur • Vous avez perdu !')
      .setDescription(`Boom ! Vous avez touché une mine.\nPlateau final :\n\`\`\`\n${plateauToText(partie.plateau, partie.decouvertes)}\n\`\`\``)
      .setColor(0xed4245);
    const offRows = buildButtonsDemineur(partie.decouvertes);
    offRows.forEach(row => row.components.forEach(b => b.setDisabled(true)));
    partiesDemineur.delete(msgId);
    return interaction.update({ embeds: [embed], components: offRows });
  }

  partie.decouvertes.add(`${r},${c}`);

  let gagne = true;
  for (let rr = 0; rr < TAILLE; rr++) {
    for (let cc = 0; cc < TAILLE; cc++) {
      if (partie.plateau[rr][cc] === 0 && !partie.decouvertes.has(`${rr},${cc}`)) {
        gagne = false;
        break;
      }
    }
    if (!gagne) break;
  }

  if (gagne) {
    const embed = new EmbedBuilder()
      .setTitle('🎉 Démineur • Vous avez gagné !')
      .setDescription(`Victoire ! Vous avez découvert toutes les cases sans toucher de mine.\nPlateau final :\n\`\`\`\n${plateauToText(partie.plateau, partie.decouvertes)}\n\`\`\``)
      .setColor(0x57f287);
    const offRows = buildButtonsDemineur(partie.decouvertes);
    offRows.forEach(row => row.components.forEach(b => b.setDisabled(true)));
    partiesDemineur.delete(msgId);
    return interaction.update({ embeds: [embed], components: offRows });
  }

  const embed = new EmbedBuilder()
    .setTitle('💥 Démineur')
    .setDescription(`Plateau :\n\`\`\`\n${plateauToText(partie.plateau, partie.decouvertes)}\n\`\`\``)
    .setColor(0x5865f2);

  const btnRows = buildButtonsDemineur(partie.decouvertes);
  return interaction.update({ embeds: [embed], components: btnRows });
}
