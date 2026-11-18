import Address from "../models/Address.js";

export const addAddress = async (req, res) => {
    try {
        const { name, mobile, pincode, flatHouse, areaStreet, landmark, townCity, state, country, isDefault, addressType } = req.body;
        // Always use the logged-in user, never trust userId from the body
        const userId = req.userId;

        if (!name || !mobile || !pincode || !flatHouse || !areaStreet || !townCity || !state || !country || !userId) {
            return res.status(400).json({ error: true, message: "Please fill all required fields" });
        }

        // If the new address is marked as default, unset default status from all existing addresses for this user
        if (isDefault) {
            await Address.updateMany({ userId }, { isDefault: false });
        }

        const newAddress = new Address({
            name,
            mobile,
            pincode,
            flatHouse,
            areaStreet,
            landmark,
            townCity,
            state,
            country,
            userId,
            addressType: addressType === "Office" ? "Office" : "Home",
            isDefault: isDefault || false
        });

        await newAddress.save();

        res.status(201).json({
            error: false,
            message: "Address added successfully!",
            data: newAddress
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
};

export const getAddresses = async (req, res) => {
    try {
        if (req.params.userId !== String(req.userId)) {
            return res.status(403).json({ error: true, message: "Not allowed" });
        }
        const addresses = await Address.find({ userId: req.userId }).sort({ isDefault: -1, createdAt: -1 });
        res.status(200).json({
            error: false,
            data: addresses
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        // Sirf yahi fields badal sakti hain (userId, status waghera nahi)
        const allowed = ["name", "mobile", "pincode", "flatHouse", "areaStreet", "landmark", "townCity", "state", "country", "isDefault", "addressType"];
        const updateData = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) updateData[key] = req.body[key];
        }
        if (updateData.addressType !== undefined) {
            updateData.addressType = updateData.addressType === "Office" ? "Office" : "Home";
        }

        // If the updated address is marked as default, unset default status from all other addresses for this user
        if (updateData.isDefault) {
            await Address.updateMany({ userId: req.userId, _id: { $ne: id } }, { isDefault: false });
        }

        const updatedAddress = await Address.findOneAndUpdate(
            { _id: id, userId: req.userId },
            updateData,
            { new: true } // Returns the modified document rather than the original
        );

        if (!updatedAddress) {
            return res.status(404).json({ error: true, message: "Address not found" });
        }

        res.status(200).json({
            error: false,
            message: "Address updated successfully!",
            data: updatedAddress
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAddress = await Address.findOneAndDelete({ _id: id, userId: req.userId });

        if (!deletedAddress) {
            return res.status(404).json({ error: true, message: "Address not found" });
        }

        res.status(200).json({
            error: false,
            message: "Address deleted successfully!"
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
};
