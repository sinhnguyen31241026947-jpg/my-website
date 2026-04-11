const fetch = global.fetch || require('node-fetch');
(async () => {
  const res = await fetch('https://puezvcfjqwhmqrhwapcj.supabase.co/functions/v1/make-server-eeef72dc/matches', {
    headers: {
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1ZXp2Y2ZqcXdobXFyaHdhcGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTA3MTgsImV4cCI6MjA4OTEyNjcxOH0.be5QBxKomWcn5q8GdIE8arvK_Kpunl1mGp71PsJY5Cs',
      'Content-Type': 'application/json'
    }
  });
  console.log('status', res.status);
  console.log(await res.text());
})();