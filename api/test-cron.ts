export default function handler(req: Request) {
  const cronSecret = req.headers.get('x-cron-secret');
  
  if (cronSecret !== process.env.CRON_SECRET_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  return new Response(JSON.stringify({ 
    message: 'Cron test successful', 
    timestamp: new Date().toISOString() 
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
} 