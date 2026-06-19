export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: '2rem' }}>
      <h1>receipt-service</h1>
      <p>
        Consumes <code>order.created</code> events and persists receipts to
        <code> tbl_receipts</code>.
      </p>
      <p>
        Inngest functions are served at <code>/api/inngest</code>. Lookup a
        receipt at <code>/api/receipts/[paymentId]</code>.
      </p>
    </div>
  );
}
