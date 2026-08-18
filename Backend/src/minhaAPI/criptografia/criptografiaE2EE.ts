import { generateKeyPairSync, publicEncrypt, privateDecrypt } from "crypto";

// Experimento RSA: as chaves são retornadas para armazenamento controlado pelo serviço.
// Nenhum arquivo de chave é criado automaticamente.
export function gerarParDeChaves() {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  return { publicKey, privateKey };
}

export function criptografarSenha(senha: string, publicKey: string): string {
  return publicEncrypt(publicKey, Buffer.from(senha, "utf-8")).toString("base64");
}

export function descriptografarSenha(
  criptografado: string,
  privateKey: string
): string {
  return privateDecrypt(
    { key: privateKey },
    Buffer.from(criptografado, "base64")
  ).toString("utf-8");
}
