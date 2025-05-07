const { createClient } = require('@supabase/supabase-js');
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');

// Helper function to format drinks from the Supabase JSON
function formatDrinks(drinksJson) {
  if (!drinksJson || !Array.isArray(drinksJson)) {
    return "No drinks specified";
  }

  return drinksJson.map(drink => {
    let nameParts = [];
    if (drink.options && drink.options.syrup) {
      nameParts.push("Syrup");
    }
    if (drink.options && drink.options.oatMilk) {
      nameParts.push("Oat");
    }
    nameParts.push(drink.name); // e.g., "Espresso"

    let formattedName = nameParts.join(" ");

    if (drink.quantity && Number(drink.quantity) > 1) {
      return `${drink.quantity} x ${formattedName}`;
    }
    return formattedName;
  }).join(", ");
}

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { order_id } = JSON.parse(event.body);

  if (!order_id) {
    return { statusCode: 400, body: 'Missing order_id' };
  }

  // Environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const mailersendApiKey = process.env.MAILERSEND_API_KEY;
  const mailersendTemplateId = process.env.MAILERSEND_TEMPLATE_ID;
  const mailersendSenderEmail = process.env.MAILERSEND_SENDER_EMAIL;
  const mailersendSenderName = process.env.MAILERSEND_SENDER_NAME || "Lemme Pop-Up Café";

  if (!supabaseUrl || !supabaseKey || !mailersendApiKey || !mailersendTemplateId || !mailersendSenderEmail) {
    console.error("Missing one or more required environment variables.");
    return { statusCode: 500, body: "Internal server configuration error." };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const mailersend = new MailerSend({ api_key: mailersendApiKey });

  try {
    // 1. Fetch order details from Supabase
    const { data: orderData, error: supabaseError } = await supabase
      .from('preorders')
      .select('name, email, pickup_time, drinks')
      .eq('id', order_id)
      .single();

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      return { statusCode: 500, body: `Error fetching order: ${supabaseError.message}` };
    }

    if (!orderData) {
      return { statusCode: 404, body: 'Order not found' };
    }

    const { name: customerName, email: customerEmail, pickup_time: pickupTime, drinks: drinksJson } = orderData;

    if (!customerEmail) {
        console.error('Customer email not found for order_id:', order_id);
        return { statusCode: 400, body: 'Customer email not found in order data.' };
    }

    // 2. Format drinks
    const formattedDrinks = formatDrinks(drinksJson);

    // 3. Prepare email using MailerSend
    const sender = new Sender(mailersendSenderEmail, mailersendSenderName);
    const recipients = [new Recipient(customerEmail, customerName || 'Valued Customer')];
    
    // Updated way to set template variables/personalization using plain objects
    const personalizationData = [
      {
        email: customerEmail, // Target recipient's email
        data: {
          "name": customerName || 'there',      // Template variable {{name}}
          "drinks": formattedDrinks,           // Template variable {{drinks}}
          "pickup_time": pickupTime            // Template variable {{pickup_time}}
        }
      }
    ];

    const emailParams = new EmailParams()
      .setFrom(sender)
      .setTo(recipients)
      .setTemplateId(mailersendTemplateId)
      .setPersonalization(personalizationData); // Pass the array of plain objects

    // 4. Send email
    await mailersend.email.send(emailParams);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Confirmation email sent successfully!' }),
    };

  } catch (error) {
    console.error('Error processing request:', error);
    let errorMessage = 'Failed to send confirmation email.';
    if (error.response && error.response.body && error.response.body.message) {
      // MailerSend specific error
      errorMessage = `MailerSend Error: ${error.response.body.message}`;
       if (error.response.body.errors) {
         errorMessage += ` Details: ${JSON.stringify(error.response.body.errors)}`;
       }
    } else if (error.message) {
      errorMessage = error.message;
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
}; 