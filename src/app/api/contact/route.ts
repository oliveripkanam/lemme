import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  let formDataObject: any = {};
  try {
    formDataObject = await request.json();
  } catch (error) {
    console.error('Error parsing JSON body:', error);
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  // Add the form name for Netlify
  const netlifyPayload = new URLSearchParams({
    'form-name': 'contact', // Ensure this matches the 'name' attribute in your form if needed
    ...formDataObject,
  });

  try {
    const response = await fetch(process.env.NETLIFY_URL || '/', { // Submit to the root path or specified URL
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