// Lazy initialization: we only initialize when the function is called.
exports.calculateShipping = async (req, res) => {
  try {
    const shippoClient = require('shippo');
    const shippo = shippoClient(process.env.SHIPPO_API_TOKEN);

    const { name, street1, city, state, zip, country } = req.body;
    if (!name || !street1 || !city || !state || !zip || !country) {
      return res.status(400).json({ message: "Missing required address fields." });
    }
    const addressFrom = { name: "WarungIndoMichigan", street1: "123 Main St", city: "Ann Arbor", state: "MI", zip: "48104", country: "US" };
    const addressTo = { name, street1, city, state, zip, country };
    const parcel = { length: "10", width: "7", height: "5", distance_unit: "in", weight: "2", mass_unit: "lb" };

    const shipment = await shippo.shipment.create({
      address_from: addressFrom,
      address_to: addressTo,
      parcels: [parcel],
      async: false
    });
    res.status(200).json({ data: shipment.rates });
  } catch (error) {
    console.error("Shippo API Error:", error);
    res.status(500).json({ message: 'Failed to calculate shipping rates.' });
  }
};