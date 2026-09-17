const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setup() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.find(b => b.name === "toko-images");
  if (exists) {
    console.log("Bucket toko-images sudah ada!");
    return;
  }
  const { error } = await supabase.storage.createBucket("toko-images", {
    public: true,
    fileSizeLimit: 5242880,
    allowedMimeTypes: ["image/jpeg","image/png","image/webp","image/gif"],
  });
  if (error) console.error("Error:", error.message);
  else console.log("Bucket toko-images berhasil dibuat!");
}
setup();