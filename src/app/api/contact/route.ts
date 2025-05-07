import { NextResponse } from 'next/server';

// Define the expected structure of the form data
interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  enquiryType: string;
  message: string;
  // Add 'form-name': string; if you expect it in the JSON body, 
  // but we'll add it manually for Netlify anyway.
}

export async function POST(request: Request) {
  let formDataObject: ContactFormData & { 'form-name'?: string }; // Allow optional form-name
  try {
    formDataObject = await request.json() as ContactFormData & { 'form-name'?: string };
  } catch (error) {
    console.error('Error parsing JSON body:', error);
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  // Prepare payload for Netlify, ensuring form-name is present
  const netlifyPayloadData: Record<string, string> = {};

  // Copy all received fields, filtering out undefined
  for (const key in formDataObject) {
    if (Object.prototype.hasOwnProperty.call(formDataObject, key)) {
      const value = (formDataObject as any)[key]; // Use any temporarily for simplicity here
      if (value !== undefined && value !== null) {
          netlifyPayloadData[key] = String(value);
      }
    }
  }
  
  // Ensure form-name is set (use received value or default)
  netlifyPayloadData['form-name'] = formDataObject['form-name'] || 'contact'; 

  // Optional: Remove honeypot field if it exists and is empty (or handle as needed)
  // if (netlifyPayloadData['bot-field'] === '') {
  //   delete netlifyPayloadData['bot-field'];
  // }

  const netlifyPayload = new URLSearchParams(netlifyPayloadData);

  // Check if running in production/Netlify environment
  const siteUrl = process.env.URL; 
  if (!siteUrl) {
    console.warn('URL environment variable not set. Skipping Netlify submission in local dev.');
    // Simulate success in local development
    return NextResponse.json({ message: 'Local submission successful (Netlify skipped)' }, { status: 200 });
  }

  try {
    console.log(`Submitting to Netlify at URL: ${siteUrl}`);
    const response = await fetch(siteUrl, { // Use the site's URL provided by Netlify env var
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: netlifyPayload.toString(),
    });

    if (response.ok) {
        console.log('Form submitted successfully to Netlify');
        return NextResponse.json({ message: 'Enquiry submitted successfully!' }, { status: 200 });
    } else {
        // Log Netlify's response if submission failed
        const errorText = await response.text();
        console.error('Netlify form submission failed:', response.status, errorText);
        return NextResponse.json({ message: 'Netlify form submission failed.' }, { status: response.status });
    }
  } catch (error: unknown) {
    console.error('Error submitting form to Netlify:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: `Server error: ${message}` }, { status: 500 });
  }
} 