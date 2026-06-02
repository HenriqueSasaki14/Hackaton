// Variáveis de ambiente para os testes (antes de qualquer import)
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.JWT_SECRET   = 'test-secret-poussin'
process.env.PORT         = '3334'
