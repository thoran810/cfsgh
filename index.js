require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});
const keep_alive = require('./keep_alive.js')

let confessionCount = 1; // Biến toàn cục để lưu trữ số confession hiện tại

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (message.content.startsWith('!confess') || message.content.startsWith('!c')) {
        const confession = message.content.startsWith('!confess') ? message.content.slice(9).trim() : message.content.slice(2).trim();
        const channel = client.channels.cache.get('1267616818617389108'); // Thay YOUR_CHANNEL_ID bằng ID của kênh bạn muốn gửi tin nhắn
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle(`Confession #${confessionCount}`)
                .setDescription(confession)
                .setColor('#0099ff')
                .setTimestamp();

            const sentMessage = await channel.send({
                embeds: [embed]
            });

            const thread = await sentMessage.startThread({
                name: `Confession #${confessionCount}`,
                autoArchiveDuration: 60,
                reason: 'Discussion thread for confession',
            });

            confessionCount++; // Tăng số confession sau khi gửi

            // Gửi tin nhắn có nút "Submit a Confession" ngay sau khi tạo confession
            const buttonMessage = await channel.send({
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('submit_confession')
                            .setLabel('Submit a Confession')
                            .setStyle(ButtonStyle.Primary)
                    )
                ],
                embeds: [
                    new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('🎉 Chào mừng đến với kênh Confession ! 🎉')
                        .setDescription('- Đây là nơi bạn có thể chia sẻ những tâm tư, suy nghĩ, và cảm xúc của mình một cách ẩn danh. Dù bạn muốn bày tỏ niềm vui, nỗi buồn, hay những câu chuyện thú vị, chúng tôi luôn sẵn sàng lắng nghe.\n- 📩 Cách gửi confession:\n1 Nhấn vào nút “Submit a Confession” bên dưới.\n2 Điền vào form và gửi đi.')
                ]
            });

            // Lưu lại ID của tin nhắn chứa nút để xóa sau này
            client.lastButtonMessageId = buttonMessage.id;
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'submit_confession') {
        const modal = new ModalBuilder()
            .setCustomId('confessionModal')
            .setTitle('Đăng Confession ẩn danh');

        const confessionInput = new TextInputBuilder()
            .setCustomId('confessionInput')
            .setLabel('CHIA SẺ TÂM TƯ CÙNG CHÚNG TÔI NHÉ!')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Không ai biết bạn là ai đâu !!!');

        const firstActionRow = new ActionRowBuilder().addComponents(confessionInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'confessionModal') {
        const confession = interaction.fields.getTextInputValue('confessionInput');
        const channel = client.channels.cache.get('1267616818617389108'); // Thay YOUR_CHANNEL_ID bằng ID của kênh bạn muốn gửi tin nhắn
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle(`Confession #${confessionCount}`)
                .setDescription(confession)
                .setColor('#0099ff')
                .setTimestamp();

            const sentMessage = await channel.send({ embeds: [embed] });
            
            const thread = await sentMessage.startThread({
                name: `Confession #${confessionCount}`,
                autoArchiveDuration: 60,
                reason: 'Discussion thread for confession',
            });

            confessionCount++; // Tăng số confession sau khi gửi

            // Xóa tin nhắn chứa nút "Submit a Confession" trước đó
            if (client.lastButtonMessageId) {
                const lastButtonMessage = await channel.messages.fetch(client.lastButtonMessageId);
                if (lastButtonMessage) {
                    await lastButtonMessage.delete();
                }
            }

            // Gửi lại tin nhắn có nút "Submit a Confession"
            const buttonMessage = await channel.send({
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('submit_confession')
                            .setLabel('Submit a Confession')
                            .setStyle(ButtonStyle.Primary)
                    )
                ],
                embeds: [
                    new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('🎉 Chào mừng đến với kênh Confession ! 🎉')
                        .setDescription('- Đây là nơi bạn có thể chia sẻ những tâm tư, suy nghĩ, và cảm xúc của mình một cách ẩn danh. Dù bạn muốn bày tỏ niềm vui, nỗi buồn, hay những câu chuyện thú vị, chúng tôi luôn sẵn sàng lắng nghe.\n- 📩 Cách gửi confession:\n1 Nhấn vào nút “Submit a Confession” bên dưới.\n2 Điền vào form và gửi đi.')
                ]
            });

            // Lưu lại ID của tin nhắn chứa nút để xóa sau này
            client.lastButtonMessageId = buttonMessage.id;

            await interaction.reply({ content: 'Confession của bạn đã được gửi!', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN); // Thay YOUR_BOT_TOKEN bằng token của bot bạn
