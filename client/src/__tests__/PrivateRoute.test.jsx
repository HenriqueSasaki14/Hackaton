import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import { PrivateRoute, AdminRoute } from '../components/PrivateRoute'

// Mock do contexto de auth
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../context/AuthContext'

describe('PrivateRoute', () => {
  it('redireciona para /auth quando não autenticado', () => {
    useAuth.mockReturnValue({ user: null, loading: false })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<PrivateRoute><div>Conteúdo privado</div></PrivateRoute>} />
          <Route path="/auth" element={<div>Página de login</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Página de login')).toBeInTheDocument()
    expect(screen.queryByText('Conteúdo privado')).not.toBeInTheDocument()
  })

  it('renderiza conteúdo quando autenticado', () => {
    useAuth.mockReturnValue({ user: { id: 'u1', name: 'Ana', role: 'USER' }, loading: false })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<PrivateRoute><div>Conteúdo privado</div></PrivateRoute>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Conteúdo privado')).toBeInTheDocument()
  })

  it('mostra spinner durante carregamento', () => {
    useAuth.mockReturnValue({ user: null, loading: true })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<PrivateRoute><div>Conteúdo</div></PrivateRoute>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.queryByText('Conteúdo')).not.toBeInTheDocument()
  })
})

describe('AdminRoute', () => {
  it('redireciona usuário comum para /dashboard', () => {
    useAuth.mockReturnValue({
      user: { id: 'u1', role: 'USER' },
      loading: false,
      isAdmin: false,
    })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminRoute><div>Painel admin</div></AdminRoute>} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Painel admin')).not.toBeInTheDocument()
  })

  it('renderiza conteúdo para admin', () => {
    useAuth.mockReturnValue({
      user: { id: 'a1', role: 'ADMIN' },
      loading: false,
      isAdmin: true,
    })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminRoute><div>Painel admin</div></AdminRoute>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Painel admin')).toBeInTheDocument()
  })
})
