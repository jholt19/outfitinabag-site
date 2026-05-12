"use client";

export default function VendorPicker({
  vendors,
  vendorId,
}: {
  vendors: { id: string; name: string }[];
  vendorId: string;
}) {
  return (
    <div className="mt-6 max-w-xl rounded-[24px] border border-black/10 bg-white p-5">
      <label className="mb-2 block text-sm font-semibold text-black">
        Select Vendor
      </label>

      <select
        value={vendorId || ""}
        onChange={(e) => {
          const id = e.currentTarget.value;
          window.location.href = `/vendor/dashboard?vendorId=${encodeURIComponent(
            id
          )}`;
        }}
        className="w-full rounded-2xl border border-black/10 bg-[#f7f5f2] px-4 py-3 text-sm font-medium text-black outline-none transition focus:border-black"
      >
        <option value="" disabled>
          Select your vendor...
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