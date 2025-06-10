const translations = {
  fr: {
    // Page principale (index.html)
    page_title: "The Kraken Bot", // Clé existante pour le titre de la page index
    title: "The Kraken Bot",
    subtitle: "Un bot Discord complet pour la musique, la modération, les sondages, et plus encore.",
    btn_features: "Fonctionnalités",
    btn_invite: "Inviter le bot",
    btn_dashboard: "Dashboard",
    btn_support: "Serveur Support",
    footer_privacy: "Politique de confidentialité",
    footer_terms: "Conditions d'utilisation",
    footer_copyright: "© 2025 The Kraken Bot",

    // Page fonctionnalités (features.html)
    features_title_page: "Fonctionnalités - The Kraken Bot", // Nouvelle clé pour le titre de la page features
    features_title: "Fonctionnalités",
    features_description: "Découvrez toutes les commandes et modules disponibles dans The Kraken Bot", // Correction du nom de la clé
    
    // Catégories de fonctionnalités
    music_title: "Musique",
    moderation_sanction_title: "Modération / Sanction",
    moderation_management_title: "Modération / Gestion",
    autoreact_title: "Auto-react / Message",
    polls_title: "Sondages",
    languages_title: "Langues",
    help_title: "Aide",

    // Commandes musique
    music_play: "Joue une musique",
    music_playlist: "Joue une playlist",
    music_add: "Ajoute une musique à la file d'attente",
    music_skip: "Passe à la musique suivante",
    music_stop: "Arrête la musique",
    music_pause: "Pause/Reprend la musique",
    music_queue: "Affiche la file d'attente",
    music_volume: "Définit le volume",
    music_loop: "Active/Désactive la boucle",
    music_nowplaying: "Affiche la musique en cours",

    // Commandes modération sanction
    mod_mute: "Mute un utilisateur",
    mod_unmute: "Unmute un utilisateur",
    mod_tempmute: "Mute temporairement",
    mod_ban: "Banni un utilisateur",
    mod_listwarn: "Liste les avertissements",
    mod_kick: "Expulse un utilisateur",
    mod_unban: "Débanni un utilisateur",
    mod_warn: "Avertit un utilisateur",
    mod_unwarn: "Retire un avertissement",

    // Commandes modération gestion
    mod_clear: "Supprime des messages",
    mod_lock: "Verrouille le salon",
    mod_unlock: "Déverrouille le salon",
    mod_slowmode: "Active le mode lent",
    mod_lockall: "Verrouille tous les salons",
    mod_unlockall: "Déverrouille tous les salons",
    mod_clear_channel: "Supprime et recrée le salon",

    // Commandes auto-react
    auto_createcommand: "Crée une commande auto",
    auto_delcommand: "Supprime une commande auto",
    auto_listcommands: "Liste les commandes auto",
    auto_respond: "Crée une auto-réponse",
    auto_delrespond: "Supprime une auto-réponse",
    auto_listrespond: "Liste les auto-réponses",
    auto_addreact: "Ajoute une auto-réaction",
    auto_delreact: "Supprime une auto-réaction",
    auto_listreact: "Liste les auto-réactions",

    // Commandes sondages
    poll_create: "Crée un sondage",
    poll_close: "Ferme un sondage",

    // Commandes langues
    lang_set: "Permet de choisir ou retirer ses rôles de langues",

    // Commande aide
    help_cmd: "Affiche la liste des commandes",

    // Page politique de confidentialité (privacy.html)
    privacy_title_page: "Politique de confidentialité – The Kraken Bot", // Nouvelle clé pour le titre de la page privacy
    privacy_title: "Politique de confidentialité",
    privacy_data_collected_title: "Données collectées",
    privacy_data_collected_text: "The Kraken Bot collecte uniquement les données nécessaires à son fonctionnement, telles que :",
    privacy_data_collected_item1: "L'identifiant des serveurs, salons, utilisateurs et rôles.",
    privacy_data_collected_item2: "Les préférences et paramètres personnalisés (préfixes, messages de bienvenue, rôles linguistiques, etc.).",
    privacy_data_collected_item3: "Les logs d'utilisation (commandes utilisées, erreurs techniques, etc.).",
    privacy_no_sensitive_data: "Aucune donnée personnelle sensible", // Texte sans '❌' pour la traduction seule
    
    privacy_data_usage_title: "Utilisation des données",
    privacy_data_usage_text: "Les données collectées sont utilisées uniquement pour :",
    privacy_data_usage_item1: "Fournir et améliorer les fonctionnalités du Bot.",
    privacy_data_usage_item2: "Gérer la configuration spécifique à chaque serveur.",
    privacy_data_usage_item3: "Analyser l'utilisation afin de corriger les bugs et optimiser le Bot.",

    privacy_data_sharing_title: "Partage des données",
    privacy_data_sharing_text: "The Kraken Bot ne partage aucune donnée avec des tiers, sauf dans les cas suivants :",
    privacy_data_sharing_item1: "Obligation légale ou demande officielle des autorités compétentes.",
    privacy_data_sharing_item2: "Avec votre consentement explicite.",

    privacy_security_title: "Sécurité",
    privacy_security_text: "Les données sont stockées avec soin sur des serveurs sécurisés. Des mesures techniques sont en place pour protéger contre l'accès non autorisé, la modification ou la suppression des données.",

    privacy_retention_title: "Durée de conservation",
    privacy_retention_text: "Les données de configuration sont conservées tant que le Bot reste actif sur le serveur. En cas de retrait du Bot d'un serveur, ces données sont supprimées dans un délai raisonnable.",

    privacy_rights_title: "Vos droits",
    privacy_rights_text: "Vous avez le droit de demander l'accès, la modification ou la suppression de vos données liées au Bot. Pour exercer ces droits, contactez l'équipe via le serveur Discord officiel.",
    
    privacy_changes_title: "Modifications de la politique",
    privacy_changes_text: "Cette politique de confidentialité peut être mise à jour. En cas de changement significatif, une notification sera communiquée via le serveur Discord officiel.",

    // Page conditions d'utilisation (terms.html)
    terms_title_page: "Conditions d'utilisation – The Kraken Bot", // Nouvelle clé pour le titre de la page terms
    terms_title: "Conditions d'utilisation",
    terms_acceptance_title: "Acceptation des conditions",
    terms_acceptance_text: "En utilisant The Kraken Bot (« le Bot »), vous acceptez les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le Bot.",

    terms_authorized_use_title: "Utilisation autorisée",
    terms_authorized_use_text: "Vous vous engagez à :",
    terms_authorized_use_item1: "Utiliser le Bot de manière conforme aux règles de Discord et à la loi en vigueur.",
    terms_authorized_use_item2: "Ne pas utiliser le Bot pour harceler, abuser ou nuire à d'autres utilisateurs.",
    terms_authorized_use_item3: "Ne pas modifier, distribuer ou copier le code source du Bot sans autorisation.",

    terms_restrictions_title: "Restrictions",
    terms_restrictions_text: "Il est strictement interdit de :",
    terms_restrictions_item1: "Utiliser le Bot dans des serveurs qui promeuvent la haine, la violence ou tout contenu illégal.",
    terms_restrictions_item2: "Exploiter ou tenter d'exploiter des vulnérabilités du Bot.",
    terms_restrictions_item3: "Surcharger les services via des requêtes abusives.",

    terms_availability_title: "Disponibilité et support",
    terms_availability_text_1: "Le Bot est fourni « tel quel » sans garantie de disponibilité, de stabilité ou de performance.",
    terms_availability_text_2: "Le support est disponible via le ",
    terms_availability_text_3: ", mais sans obligation de réponse immédiate.",
    discord_server: "serveur Discord officiel", // Clé spécifique pour le lien Discord
    
    terms_termination_title: "Résiliation",
    terms_termination_text: "L'équipe de développement se réserve le droit de :",
    terms_termination_item1: "Retirer le Bot de tout serveur à sa discrétion, notamment en cas d'abus ou de non-respect des conditions.",
    terms_termination_item2: "Suspendre ou cesser les mises à jour et le support à tout moment.",

    terms_modifications_title: "Modifications",
    terms_modifications_text: "Ces conditions peuvent être modifiées à tout moment. En cas de changement majeur, une notification sera faite via le serveur de support ou le site web du Bot.",

    // Commun
    back_to_home: "Retour à l'accueil"
  },

  en: {
    // Main page (index.html)
    page_title: "The Kraken Bot", // Existing key for index page title
    title: "The Kraken Bot",
    subtitle: "A complete Discord bot for music, moderation, polls, and more.",
    btn_features: "Features",
    btn_invite: "Invite Bot",
    btn_dashboard: "Dashboard",
    btn_support: "Support Server",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms of Service",
    footer_copyright: "© 2025 The Kraken Bot",

    // Features page (features.html)
    features_title_page: "Features - The Kraken Bot", // New key for features page title
    features_title: "Features",
    features_description: "Discover all commands and modules available in The Kraken Bot", // Corrected key name
    
    // Feature categories
    music_title: "Music",
    moderation_sanction_title: "Moderation / Sanctions",
    moderation_management_title: "Moderation / Management",
    autoreact_title: "Auto-react / Messages",
    polls_title: "Polls",
    languages_title: "Languages",
    help_title: "Help",

    // Music commands
    music_play: "Play a song",
    music_playlist: "Play a playlist",
    music_add: "Add a song to the queue",
    music_skip: "Skip to next song",
    music_stop: "Stop the music",
    music_pause: "Pause/Resume the music",
    music_queue: "Show the queue",
    music_volume: "Set the volume",
    music_loop: "Enable/Disable loop",
    music_nowplaying: "Show current song",

    // Moderation sanction commands
    mod_mute: "Mute a user",
    mod_unmute: "Unmute a user",
    mod_tempmute: "Temporarily mute",
    mod_ban: "Ban a user",
    mod_listwarn: "List warnings",
    mod_kick: "Kick a user",
    mod_unban: "Unban a user",
    mod_warn: "Warn a user",
    mod_unwarn: "Remove a warning",

    // Moderation management commands
    mod_clear: "Delete messages",
    mod_lock: "Lock the channel",
    mod_unlock: "Unlock the channel",
    mod_slowmode: "Enable slow mode",
    mod_lockall: "Lock all channels",
    mod_unlockall: "Unlock all channels",
    mod_clear_channel: "Delete and recreate the channel",

    // Auto-react commands
    auto_createcommand: "Create an auto command",
    auto_delcommand: "Delete an auto command",
    auto_listcommands: "List auto commands",
    auto_respond: "Create an auto-response",
    auto_delrespond: "Delete an auto-response",
    auto_listrespond: "List auto-responses",
    auto_addreact: "Add an auto-reaction",
    auto_delreact: "Delete an auto-reaction",
    auto_listreact: "List auto-reactions",

    // Poll commands
    poll_create: "Create a poll",
    poll_close: "Close a poll",

    // Language commands
    lang_set: "Choose or remove your language roles",

    // Help command
    help_cmd: "Show command list",

    // Privacy policy page (privacy.html)
    privacy_title_page: "Privacy Policy – The Kraken Bot", // New key for privacy page title
    privacy_title: "Privacy Policy",
    privacy_data_collected_title: "Data Collected",
    privacy_data_collected_text: "The Kraken Bot only collects data necessary for its operation, such as:",
    privacy_data_collected_item1: "Server, channel, user, and role identifiers.",
    privacy_data_collected_item2: "Custom preferences and settings (prefixes, welcome messages, language roles, etc.).",
    privacy_data_collected_item3: "Usage logs (commands used, technical errors, etc.).",
    privacy_no_sensitive_data: "No sensitive personal data", // Text without '❌' for translation only
    
    privacy_data_usage_title: "Data Usage",
    privacy_data_usage_text: "Collected data is only used to:",
    privacy_data_usage_item1: "Provide and improve Bot features.",
    privacy_data_usage_item2: "Manage server-specific configuration.",
    privacy_data_usage_item3: "Analyze usage to fix bugs and optimize the Bot.",

    privacy_data_sharing_title: "Data Sharing",
    privacy_data_sharing_text: "The Kraken Bot does not share any data with third parties, except in the following cases:",
    privacy_data_sharing_item1: "Legal obligation or official request from competent authorities.",
    privacy_data_sharing_item2: "With your explicit consent.",

    privacy_security_title: "Security",
    privacy_security_text: "Data is carefully stored on secure servers. Technical measures are in place to protect against unauthorized access, modification, or deletion of data.",

    privacy_retention_title: "Retention Period",
    privacy_retention_text: "Configuration data is retained as long as the Bot remains active on the server. If the Bot is removed from a server, this data is deleted within a reasonable timeframe.",

    privacy_rights_title: "Your Rights",
    privacy_rights_text: "You have the right to request access, modification, or deletion of your Bot-related data. To exercise these rights, contact the team via the official Discord server.",

    privacy_changes_title: "Policy Changes",
    privacy_changes_text: "This privacy policy may be updated. In case of significant changes, a notification will be communicated via the official Discord server.",

    // Terms of service page (terms.html)
    terms_title_page: "Terms of Service – The Kraken Bot", // New key for terms page title
    terms_title: "Terms of Service",
    terms_acceptance_title: "Acceptance of Terms",
    terms_acceptance_text: "By using The Kraken Bot (\"the Bot\"), you agree to these terms of service. If you do not agree to these terms, please do not use the Bot.",

    terms_authorized_use_title: "Authorized Use",
    terms_authorized_use_text: "You agree to:",
    terms_authorized_use_item1: "Use the Bot in compliance with Discord's rules and applicable law.",
    terms_authorized_use_item2: "Not use the Bot to harass, abuse, or harm other users.",
    terms_authorized_use_item3: "Not modify, distribute, or copy the Bot's source code without authorization.",

    terms_restrictions_title: "Restrictions",
    terms_restrictions_text: "It is strictly forbidden to:",
    terms_restrictions_item1: "Use the Bot on servers that promote hatred, violence, or any illegal content.",
    terms_restrictions_item2: "Exploit or attempt to exploit Bot vulnerabilities.",
    terms_restrictions_item3: "Overload services through abusive requests.",

    terms_availability_title: "Availability and Support",
    terms_availability_text_1: "The Bot is provided \"as is\" without guarantee of availability, stability, or performance.",
    terms_availability_text_2: "Support is available via the ",
    terms_availability_text_3: ", but without obligation for immediate response.",
    discord_server: "official Discord server", // Specific key for Discord link

    terms_termination_title: "Termination",
    terms_termination_text: "The development team reserves the right to:",
    terms_termination_item1: "Remove the Bot from any server at its discretion, particularly in case of abuse or non-compliance with terms.",
    terms_termination_item2: "Suspend or cease updates and support at any time.",

    terms_modifications_title: "Modifications",
    terms_modifications_text: "These terms may be modified at any time. In case of major changes, notification will be made via the support server or the Bot's website.",

    // Common
    back_to_home: "Back to Home"
  },

  es: {
    // Página principal (index.html)
    page_title: "The Kraken Bot", // Clave existente para el título de la página index
    title: "The Kraken Bot",
    subtitle: "Un bot de Discord completo para música, moderación, encuestas y más.",
    btn_features: "Características",
    btn_invite: "Invitar al bot",
    btn_dashboard: "Panel de control",
    btn_support: "Servidor de soporte",
    footer_privacy: "Política de privacidad",
    footer_terms: "Términos de servicio",
    footer_copyright: "© 2025 The Kraken Bot",

    // Página de características (features.html)
    features_title_page: "Características - The Kraken Bot", // Nueva clave para el título de la página features
    features_title: "Características",
    features_description: "Descubre todos los comandos y módulos disponibles en The Kraken Bot", // Corrección del nombre de la clave
    
    // Categorías de características
    music_title: "Música",
    moderation_sanction_title: "Moderación / Sanciones",
    moderation_management_title: "Moderación / Gestión",
    autoreact_title: "Auto-reacción / Mensajes",
    polls_title: "Encuestas",
    languages_title: "Idiomas",
    help_title: "Ayuda",

    // Comandos de música
    music_play: "Reproduce una canción",
    music_playlist: "Reproduce una lista de reproducción",
    music_add: "Añade una canción a la cola",
    music_skip: "Salta a la siguiente canción",
    music_stop: "Detiene la música",
    music_pause: "Pausa/Reanuda la música",
    music_queue: "Muestra la cola",
    music_volume: "Establece el volumen",
    music_loop: "Activa/Desactiva el bucle",
    music_nowplaying: "Muestra la canción actual",

    // Comandos de moderación sanción
    mod_mute: "Silencia a un usuario",
    mod_unmute: "Quita el silencio a un usuario",
    mod_tempmute: "Silencia temporalmente",
    mod_ban: "Banea a un usuario",
    mod_listwarn: "Lista las advertencias",
    mod_kick: "Expulsa a un usuario",
    mod_unban: "Quita el baneo a un usuario",
    mod_warn: "Advierte a un usuario",
    mod_unwarn: "Quita una advertencia",

    // Comandos de moderación gestión
    mod_clear: "Elimina mensajes",
    mod_lock: "Bloquea el canal",
    mod_unlock: "Desbloquea el canal",
    mod_slowmode: "Activa el modo lento",
    mod_lockall: "Bloquea todos los canales",
    mod_unlockall: "Desbloquea todos los canales",
    mod_clear_channel: "Elimina y recrea el canal",

    // Comandos de auto-reacción
    auto_createcommand: "Crea un comando automático",
    auto_delcommand: "Elimina un comando automático",
    auto_listcommands: "Lista los comandos automáticos",
    auto_respond: "Crea una auto-respuesta",
    auto_delrespond: "Elimina una auto-respuesta",
    auto_listrespond: "Lista las auto-respuestas",
    auto_addreact: "Añade una auto-reacción",
    auto_delreact: "Elimina una auto-reacción",
    auto_listreact: "Lista las auto-reacciones",

    // Comandos de encuestas
    poll_create: "Crea una encuesta",
    poll_close: "Cierra una encuesta",

    // Comandos de idiomas
    lang_set: "Elige o quita tus roles de idioma",

    // Comando de ayuda
    help_cmd: "Muestra la lista de comandos",

    // Página de política de privacidad (privacy.html)
    privacy_title_page: "Política de Privacidad – The Kraken Bot", // Nueva clave para el título de la página privacy
    privacy_title: "Política de Privacidad",
    privacy_data_collected_title: "Datos Recopilados",
    privacy_data_collected_text: "The Kraken Bot solo recopila los datos necesarios para su funcionamiento, tales como:",
    privacy_data_collected_item1: "Identificadores de servidores, canales, usuarios y roles.",
    privacy_data_collected_item2: "Preferencias y configuraciones personalizadas (prefijos, mensajes de bienvenida, roles de idioma, etc.).",
    privacy_data_collected_item3: "Registros de uso (comandos utilizados, errores técnicos, etc.).",
    privacy_no_sensitive_data: "Ningún dato personal sensible", // Texto sin '❌' para la traducción sola
    
    privacy_data_usage_title: "Uso de Datos",
    privacy_data_usage_text: "Los datos recopilados se utilizan únicamente para:",
    privacy_data_usage_item1: "Proporcionar y mejorar las funciones del Bot.",
    privacy_data_usage_item2: "Gestionar la configuración específica de cada servidor.",
    privacy_data_usage_item3: "Analizar el uso para corregir errores y optimizar el Bot.",

    privacy_data_sharing_title: "Compartir Datos",
    privacy_data_sharing_text: "The Kraken Bot no comparte ningún dato con terceros, excepto en los siguientes casos:",
    privacy_data_sharing_item1: "Obligación legal o solicitud oficial de autoridades competentes.",
    privacy_data_sharing_item2: "Con tu consentimiento explícito.",

    privacy_security_title: "Seguridad",
    privacy_security_text: "Los datos se almacenan cuidadosamente en servidores seguros. Se implementan medidas técnicas para proteger contra el acceso no autorizado, modificación o eliminación de datos.",

    privacy_retention_title: "Período de Retención",
    privacy_retention_text: "Los datos de configuración se conservan mientras el Bot permanezca activo en el servidor. Si el Bot es removido de un servidor, estos datos se eliminan en un plazo razonable.",

    privacy_rights_title: "Tus Derechos",
    privacy_rights_text: "Tienes derecho a solicitar acceso, modificación o eliminación de tus datos relacionados con el Bot. Para ejercer estos derechos, contacta al equipo a través del servidor oficial de Discord.",

    privacy_changes_title: "Cambios en la Política",
    privacy_changes_text: "Esta política de privacidad puede ser actualizada. En caso de cambios significativos, se comunicará una notificación a través del servidor oficial de Discord.",

    // Página de términos de servicio (terms.html)
    terms_title_page: "Términos de Servicio – The Kraken Bot", // Nueva clave para el título de la página terms
    terms_title: "Términos de Servicio",
    terms_acceptance_title: "Aceptación de Términos",
    terms_acceptance_text: "Al usar The Kraken Bot (\"el Bot\"), aceptas estos términos de servicio. Si no aceptas estos términos, por favor no uses el Bot.",

    terms_authorized_use_title: "Uso Autorizado",
    terms_authorized_use_text: "Te comprometes a:",
    terms_authorized_use_item1: "Usar el Bot de manera conforme a las reglas de Discord y la ley aplicable.",
    terms_authorized_use_item2: "No usar el Bot para acosar, abusar o dañar a otros usuarios.",
    terms_authorized_use_item3: "No modificar, distribuir o copiar el código fuente del Bot sin autorización.",

    terms_restrictions_title: "Restricciones",
    terms_restrictions_text: "Está estrictamente prohibido:",
    terms_restrictions_item1: "Usar el Bot en servidores que promuevan odio, violencia o cualquier contenido ilegal.",
    terms_restrictions_item2: "Explotar o intentar explotar vulnerabilidades del Bot.",
    terms_restrictions_item3: "Sobrecargar los servicios mediante solicitudes abusivas.",

    terms_availability_title: "Disponibilidad y Soporte",
    terms_availability_text_1: "El Bot se proporciona \"tal como está\" sin garantía de disponibilidad, estabilidad o rendimiento.",
    terms_availability_text_2: "El soporte está disponible a través del ",
    terms_availability_text_3: ", pero sin obligación de respuesta inmediata.",
    discord_server: "servidor oficial de Discord", // Clave específica para el enlace Discord

    terms_termination_title: "Terminación",
    terms_termination_text: "El equipo de desarrollo se reserva el derecho de:",
    terms_termination_item1: "Retirar el Bot de cualquier servidor a su discreción, particularmente en caso de abuso o incumplimiento de términos.",
    terms_termination_item2: "Suspender o cesar actualizaciones y soporte en cualquier momento.",

    terms_modifications_title: "Modificaciones",
    terms_modifications_text: "Estos términos pueden ser modificados en cualquier momento. En caso de cambios importantes, se hará una notificación a través del servidor de soporte o el sitio web del Bot.",

    // Común
    back_to_home: "Volver al Inicio"
  }
};

function changeLang(lang) {
  // Vérifier si la langue existe
  if (!translations[lang]) {
    console.warn(`Language ${lang} not found, defaulting to French`);
    lang = 'fr';
  }

  // Mettre à jour tous les éléments avec data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    // Vérifier si la clé existe pour la langue donnée avant de tenter d'accéder
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Mettre à jour l'attribut lang du document
  document.documentElement.lang = lang;

  // Mettre à jour le titre de la page si une clé spécifique pour le titre de la page existe
  const titleElement = document.querySelector('title');
  if (titleElement) {
    let titleKey = '';
    // Déterminer la clé du titre en fonction de la page actuelle
    if (document.URL.includes('features.html')) {
      titleKey = 'features_title_page';
    } else if (document.URL.includes('privacy.html')) {
      titleKey = 'privacy_title_page';
    } else if (document.URL.includes('terms.html')) {
      titleKey = 'terms_title_page';
    } else { // Par défaut pour index.html ou autres
      titleKey = 'page_title';
    }

    if (translations[lang] && translations[lang][titleKey]) {
      titleElement.textContent = translations[lang][titleKey];
    }
  }

  // Tenter de sauvegarder la langue choisie
  if (typeof Storage !== "undefined") {
    try {
      localStorage.setItem('siteLang', lang);
    } catch (e) {
      // Ignorer l'erreur si localStorage n'est pas disponible (ex: en mode privé)
    }
  }
}

// Fonction pour charger la langue au démarrage
function loadLanguage() {
  let lang = 'fr'; // Langue par défaut
  
  // Essayer de récupérer la langue sauvegardée
  if (typeof Storage !== "undefined") {
    try {
      lang = localStorage.getItem('siteLang') || 'fr';
    } catch (e) {
      // Ignorer l'erreur si localStorage n'est pas disponible
    }
  }
  
  changeLang(lang); // Appeler changeLang pour appliquer la langue au chargement
}

// Charger la langue quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadLanguage);
} else {
  loadLanguage();
}