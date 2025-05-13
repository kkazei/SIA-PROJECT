import { Apartment } from "../models/apartment.model.js";
import { User } from "../models/user.model.js";
import { sendRentDueReminderEmail } from "../nodemailer/emails.js";

// Function to check for apartments with rent due in 3 days
export const checkRentPaymentsDue = async () => {
    try {
        console.log("Running rent payment due check...");
        
        // Calculate the date 3 days from now
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        
        // Set time to start of day for accurate comparison
        threeDaysFromNow.setHours(0, 0, 0, 0);
        
        // Set time to end of day for the query
        const endOfDay = new Date(threeDaysFromNow);
        endOfDay.setHours(23, 59, 59, 999);
        
        console.log(`Looking for payments due on: ${threeDaysFromNow.toLocaleDateString()}`);
        
        // Find all apartments with payment due in 3 days
        const apartmentsWithDueRent = await Apartment.find({
            status: 'occupied',
            tenant_id: { $exists: true, $ne: null },
            'paymentInfo.nextDueDate': {
                $gte: threeDaysFromNow,
                $lte: endOfDay
            },
            'paymentInfo.paymentStatus': { $ne: 'paid' } // Exclude already paid
        }).populate('tenant_id', 'name email')
          .populate('landlord_id', 'name email');
        
        console.log(`Found ${apartmentsWithDueRent.length} apartments with rent due in 3 days`);
        
        // Send email notifications
        for (const apartment of apartmentsWithDueRent) {
            if (!apartment.tenant_id || !apartment.landlord_id) {
                console.log(`Skipping apartment ${apartment._id}: Missing tenant or landlord info`);
                continue;
            }
            
            try {
                await sendRentDueReminderEmail(
                    apartment.tenant_id, 
                    apartment, 
                    apartment.landlord_id
                );
                
                console.log(`Sent reminder email for apartment ${apartment._id} to ${apartment.tenant_id.email}`);
            } catch (emailError) {
                console.error(`Failed to send reminder for apartment ${apartment._id}:`, emailError);
            }
        }
        
        return {
            success: true,
            processed: apartmentsWithDueRent.length,
            message: `Processed ${apartmentsWithDueRent.length} rent due reminders`
        };
    } catch (error) {
        console.error("Error in rent payment check scheduler:", error);
        return {
            success: false,
            error: error.message
        };
    }
};