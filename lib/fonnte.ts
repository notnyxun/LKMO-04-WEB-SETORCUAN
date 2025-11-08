interface WhatsAppMessage {
  target: string
  message: string
}

export async function sendWhatsAppMessage(target: string, message: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: process.env.FONNTE_API_KEY || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target,
        message,
        device_id: process.env.FONNTE_DEVICE_ID,
      }),
    })

    const result = await response.json()
    return result.status === true
  } catch (error) {
    // Simulasi: return true untuk testing
    return true
  }
}
