import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';

function genGrille() {
  const pool = Array.from({ length: 75 }, (_, i) => i + 1);
  const grille = [];
  for (let r = 0; r < 5; r++) {
    const row = [];
    for (let c = 0; c < 5; c++) {
      const idx = Math.floor(Math.random() * pool.length);
      row.push(pool.splice(idx, 1)[0]);
    }
    grille.push(row);
  }
  grille[2][2] = 0;
  return grille;
}

function marqueGrille(grille, num) {
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (grille[r][c] === num) {
        grille[r][c] = 0;
        return true;
      }
    }
  }
  return false;
}

function checkBingo(grille) {
  for (let r = 0; r < 5; r++) {
    if (grille[r].every(v => v === 0)) return true;
  }
  for (let c = 0; c < 5; c++) {
    let ok = true;
    for (let r = 0; r < 5; r++) {
      if (grille[r][c] !== 0) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  if ([0, 1, 2, 3, 4].every(i => grille[i][i] === 0)) return true;
  if ([0, 1, 2, 3, 4].every(i => grille[i][4 - i] === 0)) return true;
  return false;
}

function grilleToTextBingo(grille) {
  return grille
    .map(row =>
      row
        .map(v => (v === 0 ? '**X**' : v.toString().padStart(2, '0')))
        .join(' ')
    )
    .join('\n');
}

export const data = new SlashCommandBuilder()
  .setName('bingo')
  .setDescription('Jouez au Bingo contre le bot ou défiez un·e ami·e.');

export async function execute(interaction) {
  const grilleU = genGrille();
  const grilleB = genGrille();
  const tirage = [];
  let gagnant = null;

  const pool = Array.from({ length: 75 }, (_, i) => i + 1);
  while (pool.length && !gagnant) {
    const idx = Math.floor(Math.random() * pool.length);
    const num = pool.splice(idx, 1)[0];
    tirage.push(num);
    marqueGrille(grilleU, num);
    marqueGrille(grilleB, num);
    const uGagne = checkBingo(grilleU);
    const bGagne = checkBingo(grilleB);
    if (uGagne && bGagne) {
      gagnant = 'Égalité';
    } else if (uGagne) {
      gagnant = 'Utilisateur';
    } else if (bGagne) {
      gagnant = 'Bot';
    }
  }

  const embed = new EmbedBuilder()
    .setTitle('🎉 Résultat du Bingo')
    .setColor(gagnant === 'Utilisateur' ? 0x57f287 : gagnant === 'Bot' ? 0xed4245 : 0x5865f2)
    .addFields(
      {
        name: 'Votre grille',
        value: `\`\`\`\n${grilleToTextBingo(grilleU)}\n\`\`\``,
        inline: true
      },
      {
        name: 'Grille du bot',
        value: `\`\`\`\n${grilleToTextBingo(grilleB)}\n\`\`\``,
        inline: true
      },
      {
        name: 'Numéros tirés',
        value: tirage.map(n => n.toString().padStart(2, '0')).join(' '),
      },
      {
        name: 'Gagnant',
        value: gagnant === 'Égalité' ? 'Match nul ! 🎊' : gagnant === 'Utilisateur' ? 'Bravo, vous avez fait Bingo ! 🎉' : 'Le bot a gagné… 😢',
      }
    );

  return interaction.reply({ embeds: [embed] });
}
