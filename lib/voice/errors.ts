export class VoiceError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(message: string, status = 400, code = "voice_error") {
    super(message);
    this.name = "VoiceError";
    this.status = status;
    this.code = code;
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof VoiceError) {
    return {
      status: error.status,
      body: { error: error.message, code: error.code },
    };
  }

  const message =
    error instanceof Error ? error.message : "Unexpected voice service error";

  return {
    status: 500,
    body: { error: message, code: "voice_internal_error" },
  };
}
