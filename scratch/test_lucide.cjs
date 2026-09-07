async function test() {
  const lucide = await import('lucide-react');
  console.log('Total exports:', Object.keys(lucide).length);
  
  const searchKeys = ['link', 'linkedin', 'insta', 'instagram', 'facebook', 'twitter'];
  searchKeys.forEach(key => {
    const matches = Object.keys(lucide).filter(k => k.toLowerCase().includes(key));
    console.log(`Matches for "${key}":`, matches);
  });
}
test();
