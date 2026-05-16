(async () => {
  const payload = {
    update_id: 123456789,
    message: {
      message_id: 1,
      from: { id: 111111111, is_bot: false, first_name: 'Teste', username: 'test_user' },
      chat: { id: 111111111, type: 'private', username: 'test_user', first_name: 'Teste' },
      date: Math.floor(Date.now() / 1000),
      text: 'Olá bot'
    }
  };
  try {
    const res = await fetch('http://127.0.0.1:10000/api/telegram/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const txt = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', txt);
  } catch (e) {
    console.error('Error:', e);
  }
})();
