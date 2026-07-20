import Image from "next/image";

// Marca real: mira de scouting + pelota (círculo hexagonal) integrada en la
// "O" de "Scoutline". "icon" recorta solo la marca para espacios chicos
// (headers, favicon); "full" es el wordmark completo para momentos de marca
// (login/registro).
export function Logo({
  size = 32,
  variant = "icon",
  className = "",
}: {
  size?: number;
  variant?: "icon" | "full";
  className?: string;
}) {
  if (variant === "full") {
    return (
      <Image
        src="/logo-full.png"
        alt="Scoutline"
        width={704}
        height={384}
        style={{ height: size, width: "auto" }}
        className={className}
        priority
      />
    );
  }

  return (
    <Image
      src="/logo-icon.png"
      alt="Scoutline"
      width={174}
      height={174}
      style={{ height: size, width: size }}
      className={className}
    />
  );
}
