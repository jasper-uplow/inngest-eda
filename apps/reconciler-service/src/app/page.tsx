export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: '2rem' }}>
      <h1>reconciler-service</h1>
      <p>
        Drains <code>tbl_events</code> pending sends and re-emits
        published-but-unacked events on a schedule.
      </p>
      <p>
        Inngest functions are served at <code>/api/inngest</code>.
      </p>
    </div>
  );
}
