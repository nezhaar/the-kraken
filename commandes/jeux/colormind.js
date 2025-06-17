// ColorMind++ : jeu de type Mastermind avec des couleurs et émojis

import {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';

const COLOR_POOL = [
  { name: '🔴', hex: '#FF0000' },
  { name: '🟢', hex: '#00FF00' },
  { name: '🔵', hex: '#0000FF' },
  { name: '🟡', hex: '#FFFF00' },
  { name: '🟣', hex: '#800080' },
  { name: '🟠', hex: '#FFA500' },
  { name: '⚪', hex: '#FFFFFF' },
  { name: '⚫', hex: '#000000' },
];

const activeGames = new Map();
const currentSelections = new Map();

function generateSecret() {
  const pool = [...COLOR_POOL];
  const secret = [];
  for (let i = 0; i < 5; i++) {
    const pick = pool[Math.floor(Math.random() * pool.length)].name;
    secret.push(pick);
  }
  return secret;
}

function compareGuess(secret, guess) {
  let exact = 0;
  let misplaced = 0;
  const secretCopy = [...secret];
  const guessCopy = [...guess];

  for (let i = 0; i < 5; i++) {
    if (guess[i] === secret[i]) {
      exact++;
      secretCopy[i] = null;
      guessCopy[i] = null;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (guessCopy[i]) {
      const index = secretCopy.indexOf(guessCopy[i]);
      if (index !== -1) {
        misplaced++;
        secretCopy[index] = null;
      }
    }
  }

  return { exact, misplaced };
}

function createSelectMenus() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('colormind_guess')
      .setPlaceholder('Choisis 5 couleurs dans l’ordre')
      .setMinValues(5)
      .setMaxValues(5)
      .addOptions(
        COLOR_POOL.map(c => ({
          label: c.name,
          value: c.name,
          description: c.hex,
          emoji: c.name,
        }))
      )
  );
}

function createValidateButton() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('colormind_validate')
      .setLabel('✅ Valider')
      .setStyle(ButtonStyle.Success)
  );
}

export const data = new SlashCommandBuilder()
  .setName('colormind')
  .setDescription('Jeu de mastermind coloré à base d’émojis.');

export async function execute(interaction) {
  const secret = generateSecret();
  activeGames.set(interaction.user.id, secret);

  const embed = new EmbedBuilder()
    .setTitle('🎨 ColorMind ++')
    .setDescription(
      `Une combinaison secrète de 5 couleurs a été générée.\nChoisis 5 couleurs dans l'ordre, puis clique sur "Valider".`
    )
    .setColor('#cccccc');

  const row = createSelectMenus();
  const buttonRow = createValidateButton();

  await interaction.reply({ embeds: [embed], components: [row, buttonRow] });
}

export async function handleColormindComponent(interaction) {
  const userId = interaction.user.id;

  if (interaction.isStringSelectMenu() && interaction.customId === 'colormind_guess') {
    currentSelections.set(userId, interaction.values);
    return interaction.reply({
      content: '✅ Sélection enregistrée. Clique sur "Valider" pour confirmer ta combinaison.',
      ephemeral: true,
    });
  }

  if (interaction.isButton() && interaction.customId === 'colormind_validate') {
    const guess = currentSelections.get(userId);
    const secret = activeGames.get(userId);

    if (!guess || guess.length !== 5) {
      return interaction.reply({
        content: '❌ Tu dois d’abord sélectionner 5 couleurs.',
        ephemeral: true,
      });
    }

    if (!secret) {
      return interaction.reply({
        content: "❌ Pas de partie active pour toi. Utilise /colormind pour commencer !",
        ephemeral: true,
      });
    }

    const { exact, misplaced } = compareGuess(secret, guess);
    const win = exact === 5;

    const resultEmbed = new EmbedBuilder()
      .setTitle(win ? '🎉 Gagné !' : 'Tentative')
      .setDescription(
        `${guess.join(' ')}\n✅ Bien placées : ${exact}\n🔁 Mal placées : ${misplaced}`
      )
      .setColor(win ? '#57F287' : '#5865F2');

    if (win) {
      activeGames.delete(userId);
      currentSelections.delete(userId);
    }

    try {
      await interaction.update({
        embeds: [resultEmbed],
        components: win ? [] : [createSelectMenus(), createValidateButton()],
      });
    } catch (error) {
      console.error('[ColorMind] Erreur interaction.update :', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: '❌ Une erreur est survenue en mettant à jour le message.',
          ephemeral: true,
        });
      }
    }
  }
}
