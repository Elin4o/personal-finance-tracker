export function required(
  value: string,
  message = "This field is required.",
): string | undefined {
  return value.trim() === "" ? message : undefined;
}

export function positiveAmount(
  value: string,
  message = "Enter an amount greater than 0.",
): string | undefined {
  if (!value || parseFloat(value) <= 0) return message;
  return undefined;
}

export function exactLength(
  value: string,
  length: number,
  message: string,
): string | undefined {
  return value.trim().length !== length ? message : undefined;
}
