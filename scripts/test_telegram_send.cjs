const token = '8766470825:AAEg6tUojiHHF6KCr4TPg-DQzxSMz72lvFU';

async function performTest() {
    try {
        // 1. Pegar atualizações para achar o chat_id
        const updatesUrl = `https://api.telegram.org/bot${token}/getUpdates`;
        const updatesRes = await fetch(updatesUrl);
        const updatesData = await updatesRes.json();

        if (!updatesData.ok || updatesData.result.length === 0) {
            console.error('❌ Nenhuma mensagem encontrada. Certifique-se de que enviou "ola" para o bot.');
            return;
        }

        // Pegar o chat_id do último usuário que mandou mensagem
        const lastUpdate = updatesData.result[updatesData.result.length - 1];
        const chatId = lastUpdate.message.chat.id;
        const userName = lastUpdate.message.from.first_name || 'Usuário';

        console.log(`✅ Chat ID encontrado: ${chatId} (${userName})`);

        // 2. Enviar a mensagem de teste
        const sendUrl = `https://api.telegram.org/bot${token}/sendMessage`;
        const sendRes = await fetch(sendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: `🚀 Olá ${userName}! Teste de Conexão iAmobil bem-sucedido.\n\nSeu novo bot está configurado e pronto para trabalhar. O sistema agora pode enviar alertas e responder clientes automaticamente!`
            })
        });

        const sendData = await sendRes.json();
        if (sendData.ok) {
            console.log('✅ Mensagem de teste enviada com sucesso!');
        } else {
            console.error('❌ Erro no envio:', sendData.description);
        }

    } catch (error) {
        console.error('❌ Erro no processo:', error.message);
    }
}

performTest();
