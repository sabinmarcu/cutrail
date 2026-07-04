const runtimeInfo = window.cutrail?.getRuntimeInfo?.() ?? null;

export const App = () => (
  <main className="page">
    <section className="shell">
      <p className="eyebrow">phase 0 in progress</p>
      <h1>cutrail bootstrap shell</h1>
      <p>
        Electron + React wiring is active with preload isolation and a minimal renderer.
      </p>
      <ul>
        <li>contextIsolation enabled</li>
        <li>nodeIntegration disabled</li>
        <li>preload bridge exposed through window.cutrail</li>
      </ul>
      <pre className="runtime">
        {runtimeInfo ? JSON.stringify(runtimeInfo, null, 2) : 'runtime info unavailable'}
      </pre>
    </section>
  </main>
);
