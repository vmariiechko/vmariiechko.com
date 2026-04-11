exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Parse request body
  let email, tag;
  try {
    const parsed = JSON.parse(event.body);
    email = parsed.email;
    tag = parsed.tag;
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid request body' }),
    };
  }

  if (!email) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Email is required' }),
    };
  }

  const apiHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
  };
  const tags = tag ? [tag] : [];

  // Attempt to create the subscriber.
  // X-Buttondown-Collision-Behavior: add merges tags on existing active subscribers
  // instead of rejecting the request, so re-submits by active subscribers succeed.
  try {
    const createResponse = await fetch('https://api.buttondown.com/v1/subscribers', {
      method: 'POST',
      headers: { ...apiHeaders, 'X-Buttondown-Collision-Behavior': 'add' },
      body: JSON.stringify({ email_address: email, tags }),
    });

    if (createResponse.ok || createResponse.status === 201) {
      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ok' }),
      };
    }

    // On 400, the subscriber likely exists but is unsubscribed.
    // Fall back to PATCH to update their record (re-adds tags, may reactivate).
    if (createResponse.status === 400) {
      const patchResponse = await fetch(
        `https://api.buttondown.com/v1/subscribers/${encodeURIComponent(email)}`,
        {
          method: 'PATCH',
          headers: apiHeaders,
          body: JSON.stringify({ tags }),
        }
      );

      if (patchResponse.ok || patchResponse.status === 200) {
        return {
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'ok' }),
        };
      }

      const patchData = await patchResponse.json();
      return {
        statusCode: patchResponse.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchData),
      };
    }

    // Any other non-success status from create (e.g. invalid email)
    const createData = await createResponse.json();
    return {
      statusCode: createResponse.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createData),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to reach Buttondown API' }),
    };
  }
};
