export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Test Page - App is Working!</h1>
      <p>If you can see this, the React app is loading correctly.</p>
      <div style={{ marginTop: '20px' }}>
        <h2>Quick Links:</h2>
        <ul>
          <li><a href="/login">Login Page</a></li>
          <li><a href="/dashboard">Dashboard (requires login)</a></li>
          <li><a href="/analytics">Analytics (requires login)</a></li>
          <li><a href="/admin/audit">Audit Log (requires admin login)</a></li>
        </ul>
      </div>
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Test Login Credentials:</h3>
        <p><strong>Email:</strong> s.miller@genzura.law</p>
        <p><strong>Password:</strong> Genzura2026!</p>
      </div>
    </div>
  );
}
