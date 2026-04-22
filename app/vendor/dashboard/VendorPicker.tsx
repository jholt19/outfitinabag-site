"use client";

export default function VendorPicker({
  vendors,
  vendorId,
}: {
  vendors: { id: string; name: string }[];
  vendorId: string;
}) {
  return (
    <div style={{ marginTop: 14, maxWidth: 520 }}>
      <label style={{ fontWeight: 900, display: "block", marginBottom: 6 }}>Vendor</label>

      <select
        value={vendorId || ""}
        onChange={(e) => {
          const id = e.currentTarget.value;
          window.location.href = `/vendor/dashboard?vendorId=${encodeURIComponent(id)}`;
        }}
        style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", width: "100%" }}
      >
        <option value="" disabled>
          Select your vendor…
        </option>

        {vendors.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>
    </div>
  );
}
