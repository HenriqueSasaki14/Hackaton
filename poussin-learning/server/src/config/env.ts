import dotenv from 'dotenv'
dotenv.config()

function required(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Variável de ambiente obrigatória não definida: ${key}`)
  return value
}

export const env = {
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET:   required('JWT_SECRET'),
  PORT:         process.env.PORT || '3333',
}
