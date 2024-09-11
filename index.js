require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// File paths for storing setup channels and donations
const setupChannelsFilePath = path.join(__dirname, 'setupChannels.json');
const donationsFilePath = path.join(__dirname, 'donations.json');

// Map to store the channels where setup has been used
let setupChannels = new Map();
// Map to store donations (loaded from the file)
let donations = new Map();

// Roles that can use the special event command
const allowedRoles = ['Council', 'Admin', 'Chief'];

// Define the Smoke Signals channel name or ID
const smokeSignalsChannelName = 'smoke-signals'; // Set to the name of your Smoke Signals channel
const smokeSignalsChannelID = '1282228480678821918'; // Alternatively, use the channel ID if preferred

// Channel ID for shared storage and ledger channels
const sharedStorageChannelID = '1282216830668243015';
const ledgerChannelID = '1279247602730401845'; // Ledger channel for cash donations

// Random IN and OUT responses configuration
const inResponses = [
    "🔥 {nickname}'s smoke signal is seen and smelled across the lands!",
    "🔥 {nickname}'s smoke signal rises high into the sky!",
    "🔥 {nickname}'s smoke signal reaches the tallest mountain peaks!",
    "🔥 The sky is filled with {nickname}'s smoke signal, visible for miles!",
    "🔥 {nickname}'s smoke signal burns brightly, a beacon for all to see!",
    "🔥 {nickname}'s fire is strong, and their smoke signal calls out to distant lands!",
    "🔥 {nickname}'s signal can be seen from every corner of the valley!",
    "🔥 {nickname}'s smoke signal reaches the heavens above, spreading far and wide!",
    "🔥 {nickname}'s smoke signal lights up the night sky, calling out to the stars!",
    "🔥 {nickname} has sent a smoke signal that's impossible to miss!",
    "🔥 {nickname}'s smoke signal blazes across the horizon, visible for miles!",
    "🔥 {nickname}'s smoke signal reaches the stars, calling out to the universe!",
    "🔥 The winds carry {nickname}'s smoke signal far and wide for all to see!",
    "🔥 {nickname}'s smoke signal rises like a phoenix, powerful and bright!",
    "🔥 {nickname}'s flames roar, sending signals that cannot be ignored!",
    "🔥 {nickname}'s smoke signal lights up the entire valley!",
    "🔥 The sky dances with {nickname}'s smoke, drawing eyes from all directions!",
    "🔥 {nickname} sends a signal so fierce that even the clouds part to make way!",
    "🔥 {nickname}'s smoke signal is a beacon of strength, seen from the highest peaks!",
    "🔥 The fire of {nickname} burns so bright, their smoke signal illuminates the night sky!",
    "🔥 {nickname}'s smoke signal paints the sky with fiery brilliance!",
    "🔥 {nickname}'s smoke signal roars like a mighty bonfire, seen by all!",
    "🔥 {nickname}'s flames crackle and their smoke signal pierces the clouds!",
    "🔥 {nickname}'s smoke signal dances with the winds, reaching far and wide!",
    "🔥 From the highest mountains to the deepest valleys, {nickname}'s signal is undeniable!",
    "🔥 {nickname}'s signal is a blazing trail across the heavens!",
    "🔥 {nickname}'s smoke rises fiercely, a symbol of resilience and strength!",
    "🔥 {nickname}'s flames burn strong, their signal rising like a dragon's breath!",
    "🔥 All eyes turn to the horizon as {nickname}'s smoke signal dominates the sky!",
    "🔥 {nickname}'s fire roars to life, sending smoke signals visible for miles!",
    "🔥 {nickname}'s signal rises high, a testament to their indomitable spirit!",
    "🔥 The flames of {nickname}'s fire burn high, sending signals to all who watch!",
    "🔥 {nickname}'s signal blazes through the twilight, marking their presence!",
    "🔥 The flames of {nickname}'s fire speak louder than words, reaching the distant hills!",
    "🔥 {nickname}'s smoke dances with the stars, a message carried across the night!",
    "🔥 The world watches as {nickname}'s smoke signal illuminates the horizon!",
    "🔥 {nickname}'s smoke signal rises higher with each gust of wind, seen by all!",
    "🔥 The heavens respond as {nickname}'s smoke signal lights the sky with fiery passion!",
    "🔥 {nickname}'s fire roars with intensity, sending smoke signals to every corner of the land!",
    "🔥 With a mighty blaze, {nickname}'s signal shoots skyward, undeniable to all!"
];


const outResponses = [
    "💨 {nickname}'s smoke signal fades into the wind as the fire dies out.",
    "💨 {nickname}'s smoke signal disappears in the breeze.",
    "💨 The wind blew away {nickname}'s smoke signal, it's barely visible now.",
    "💨 {nickname}'s fire flickered and their smoke signal vanished into thin air.",
    "💨 {nickname}'s smoke signal was short-lived as the flames died down.",
    "💨 The wind has claimed {nickname}'s smoke signal, sending it to the horizon.",
    "💨 {nickname}'s smoke signal dissipated before it could be seen by many.",
    "💨 The fire burned out too quickly, and {nickname}'s smoke signal was lost.",
    "💨 {nickname}'s smoke signal barely lingered before the wind carried it away.",
    "💨 {nickname}'s signal was gone in an instant, scattered by the gusts.",
    "💨 {nickname}'s smoke signal barely flickers before the wind snuffs it out.",
    "💨 {nickname}'s flames die down, leaving only a trace of smoke in the sky.",
    "💨 The wind took {nickname}'s smoke signal, scattering it into the distance.",
    "💨 {nickname}'s signal vanished like a whisper on the wind.",
    "💨 {nickname}'s fire dims as the smoke fades into the twilight.",
    "💨 The embers of {nickname}'s fire cool, leaving only wisps of smoke behind.",
    "💨 {nickname}'s smoke signal struggles against the wind, disappearing quickly.",
    "💨 The wind swirls and disperses {nickname}'s signal before it reaches far.",
    "💨 {nickname}'s smoke is carried away, disappearing over the mountains.",
    "💨 The fire dims, and {nickname}'s smoke signal drifts off into nothingness.",
    "💨 The final embers of {nickname}'s fire flicker, and the smoke vanishes into the night.",
    "💨 {nickname}'s fire is extinguished, leaving no trace of their smoke signal.",
    "💨 A gust of wind silences {nickname}'s smoke signal, scattering it into the void.",
    "💨 {nickname}'s signal fades like a shadow as the last of the fire dies down.",
    "💨 {nickname}'s smoke signal is lost in the wind, nothing left but faint ashes.",
    "💨 The last wisps of {nickname}'s smoke signal are swept away by the breeze.",
    "💨 {nickname}'s fire dwindles, and their smoke signal is carried off into the clouds.",
    "💨 {nickname}'s smoke signal lingers for a moment before disappearing into thin air.",
    "💨 {nickname}'s flames flicker out, and their signal dissolves into the wind.",
    "💨 {nickname}'s fire grows cold, and their smoke signal vanishes like a fleeting memory.",
    "💨 {nickname}'s smoke signal drifts aimlessly before vanishing beyond the horizon.",
    "💨 The wind snatches away {nickname}'s signal, leaving nothing but silence behind.",
    "💨 {nickname}'s smoke signal fades as the last embers of the fire cool.",
    "💨 The sky clears as {nickname}'s smoke signal is blown away by the wind.",
    "💨 {nickname}'s flames extinguish, and their smoke signal is lost to the breeze."
];


// Load the setup channels from the file
async function loadSetupChannels() {
    try {
        const data = await fs.readFile(setupChannelsFilePath, 'utf8');
        const parsedData = JSON.parse(data);
        
        // Reconstruct the outer map, and convert each inner map back to a Map
        setupChannels = new Map(parsedData.map(([guildId, channels]) => [guildId, new Map(channels)]));
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('setupChannels.json does not exist, starting with an empty map.');
            setupChannels = new Map();
        } else {
            console.error('Failed to load setup channels:', error);
        }
    }
}

// Save the setup channels to the file
async function saveSetupChannels() {
    try {
        // Convert maps to arrays to store in JSON format
        const data = JSON.stringify(Array.from(setupChannels.entries(), ([guildId, channels]) => [guildId, Array.from(channels.entries())]), null, 2);
        await fs.writeFile(setupChannelsFilePath, data, 'utf8');
    } catch (error) {
        console.error('Failed to save setup channels:', error);
    }
}

// Load donations from file
async function loadDonations() {
    try {
        const data = await fs.readFile(donationsFilePath, 'utf8');
        donations = new Map(JSON.parse(data));
    } catch (error) {
        if (error.code === 'ENOENT') {
            donations = new Map(); // Start with an empty map if file doesn't exist
        } else {
            console.error('Failed to load donations:', error);
        }
    }
}

// Save donations to file
async function saveDonations() {
    try {
        const data = JSON.stringify(Array.from(donations.entries()), null, 2);
        await fs.writeFile(donationsFilePath, data, 'utf8');
    } catch (error) {
        console.error('Failed to save donations:', error);
    }
}

// Utility function to pick a random response from a list and replace the nickname placeholder
function getRandomResponse(responses, nickname) {
    if (!responses || responses.length === 0) return '';
    const randomIndex = Math.floor(Math.random() * responses.length);
    const response = responses[randomIndex];
    return response && nickname ? response.replace('{nickname}', nickname) : response || '';
}

// Utility function to send the smoke signal message without pinning
async function sendSmokeSignalMessage(channel) {
    try {
        // Send the new smoke signal message
        const sentMessage = await channel.send("React to this message to show your status:");
        await sentMessage.react('🔥'); // IN reaction
        await sentMessage.react('💨'); // OUT reaction

        return sentMessage;
    } catch (error) {
        console.error('Failed to send smoke signal message:', error);
        throw error;
    }
}

// Function to check if a user has one of the allowed roles
function hasAllowedRole(member) {
    return member.roles.cache.some(role => allowedRoles.includes(role.name));
}

// Function to get the Smoke Signals channel
function getSmokeSignalsChannel(guild) {
    let channel = guild.channels.cache.find(ch => ch.name === smokeSignalsChannelName);
    if (!channel && smokeSignalsChannelID) {
        channel = guild.channels.cache.get(smokeSignalsChannelID);
    }
    return channel;
}

// Emoji mapping for commonly donated items
const emojiMapping = {
meat: '🍖',
food: '🍗',
water: '💧',
ammo: '🔫',
arrows: '🏹',
feather: '🪶',
revolver: '🔫',
knife: '🔪',
horse: '🐎',
deer_pelt: '🦌',
wolf_pelt: '🐺',
bear_pelt: '🐻',
health_tonic: '🧪',
stamina_tonic: '💊',
herbs: '🌿',
mushrooms: '🍄',
whiskey: '🥃',
wine: '🍷',
fishing_rod: '🎣',
fish: '🐟',
jewelry: '💍',
gold_bar: '🥇',
silver_bar: '🥈',
money: '💰',
pants: '👖',
shirt: '👕',
boots: '👢',
cigarettes: '🚬',
cigars: '🪵',
iron: '🔩',
stone: '🪨',
bait: '🐛',
};

// Function to find the matching emoji for a donated item
function getEmojiForDonation(item) {
    return emojiMapping[item.toLowerCase()] || '📦'; // Default to a box emoji if no match is found
}

// Utility function to send a donation message to the shared-storage channel
async function postDonationMessage(guild, donationMessage) {
    const sharedStorageChannel = guild.channels.cache.get(sharedStorageChannelID);
    if (sharedStorageChannel) {
        await sharedStorageChannel.send(donationMessage);
    } else {
        console.error('Shared storage channel not found');
    }
}

// Utility function to send a cash donation message to the ledger channel
async function postCashDonationMessage(guild, donationMessage) {
    const ledgerChannel = guild.channels.cache.get(ledgerChannelID);
    if (ledgerChannel) {
        await ledgerChannel.send(donationMessage);
    } else {
        console.error('Ledger channel not found');
    }
}

// Load the setup channels and donations when the bot starts
loadSetupChannels();
loadDonations();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Define the role required to use donation commands
const requiredRole = 'Tribe';

// Utility function to check if a user has the required role or higher
function hasRequiredRole(member) {
    return member.roles.cache.some(role => role.name === requiredRole || allowedRoles.includes(role.name));
}

// Command to handle help, donations, and other commands
client.on('messageCreate', async message => {
    try {
        const { guild, content, author, member } = message;

        // Ignore bot's own messages
        if (author.bot) return;

        // Help command: send a private message with commands they can use
        if (content.startsWith('!help')) {
            let helpMessage = `**Here are the commands you can use:**\n\n`;

            // Check for roles and add relevant commands
            if (hasRequiredRole(member)) {
                helpMessage += `\`\`\`!donated itemname amount\`\`\` - Donate items to the tribe. Example: \`!donated arrows 50\`\n\n`;
                helpMessage += `\`\`\`!donated cashamount DescriptionOfCashDonationHere\`\`\` - Donate cash to the tribe. Example: \`!donated 100 For camp supplies\`\n\n`;
                helpMessage += `\`\`\`!mydonations\`\`\` - View all your past donations, both items and cash.\n\n`;
            }

            // Add role-restricted commands (Council/Admin/Chief)
            if (hasAllowedRole(member)) {
                helpMessage += `\`\`\`!bonfire\`\`\` - Light the grand bonfire, visible across the land. Only available to Council, Admin, and Chief roles.\n\n`;
                helpMessage += `\`\`\`!setup channelid\`\`\` - (Do not use this command if Smoke-Signals is already functioning) Set up a smoke signal message in a specific channel. Example: \`!setup 1282216830668243015\`\n\n`;
            }

            // Send help message in a private DM
            await author.send(helpMessage);
            await message.reply('I\'ve sent you a list of commands you can use in a private message.');
        }

        // Check if the user has the required role for donation commands
        if (content.startsWith('!donated') || content.startsWith('!mydonations')) {
            if (!hasRequiredRole(member)) {
                await message.reply('You do not have permission to use this command.');
                return;
            }
        }

        // Donation command for items and cash
        if (content.startsWith('!donated')) {
            const args = content.split(' ');
            
            // Check if it's a cash donation
            if (args.length >= 3 && !isNaN(args[1])) {
                // Cash donation format: !donated cashamount DescriptionOfCashDonationHere
                const cashAmount = parseInt(args[1], 10);
                const description = args.slice(2).join(' '); // Capture the rest as description

                const donationMessage = `💰 **${author.username}** donated **$${cashAmount}** for **${description}**.`;

                // Store the cash donation
                if (!donations.has(author.id)) {
                    donations.set(author.id, { items: [], cash: 0 });
                }
                donations.get(author.id).cash += cashAmount;

                // Save donations to file
                await saveDonations();

                // Post the donation message to the ledger channel
                await postCashDonationMessage(guild, donationMessage);
                
                await message.reply('Thank you for your cash donation!');
            } else if (args.length === 3) {
                // Item donation format: !donated #itemname #amount
                const itemName = args[1];
                const donationAmount = parseInt(args[2], 10);

                // Find the emoji for the donated item
                const donationEmoji = getEmojiForDonation(itemName);

                const donationMessage = `${donationEmoji} **${author.username}** donated **${donationAmount}** of **${itemName}** to the tribe!`;

                // Store the item donation
                if (!donations.has(author.id)) {
                    donations.set(author.id, { items: [], cash: 0 });
                }

                donations.get(author.id).items.push({
                    type: itemName,
                    amount: donationAmount,
                    date: new Date().toISOString(),
                });

                // Save donations to file
                await saveDonations();

                // Post the item donation message to the shared-storage channel
                await postDonationMessage(guild, donationMessage);

                await message.reply('Thank you for your item donation!');
            } else {
                await message.reply('Invalid donation command. Use "!donated #itemname #amount" for items or "!donated #cashamount DescriptionOfCashDonationHere" for cash.');
            }
        }

        // Command to show user's donations (private message)
        if (content.startsWith('!mydonations')) {
            if (!donations.has(author.id)) {
                await author.send('You have not made any donations yet.');
                return;
            }

            const userDonations = donations.get(author.id);
            let donationSummary = 'Here are your donations to the tribe:\n\n';

            // Add item donations to the summary
            userDonations.items.forEach(donation => {
                const donationDate = new Date(donation.date).toLocaleDateString();
                donationSummary += `- ${donation.amount} of ${donation.type} on ${donationDate}\n`;
            });

            // Add cash donations to the summary
            donationSummary += `\nTotal cash donated: $${userDonations.cash}\n`;

            await author.send(donationSummary);
        }
    } catch (error) {
        console.error('Error processing message:', error);
    }
});





client.login(process.env.DISCORD_TOKEN);
