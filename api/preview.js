export default async function handler(req, res) {
    const { trackId } = req.query;
    if (!trackId) {
      return res.status(400).json({ error: "Missing trackId" });
    }
  
    const deezerRes = await fetch(`https://api.deezer.com/track/${trackId}`);
    const deezerData = await deezerRes.json();
  
    if (!deezerData || !deezerData.preview) {
      return res.status(404).json({ error: "Preview not found" });
    }
  
    res.status(200).json({ preview: deezerData.preview });
  }
  