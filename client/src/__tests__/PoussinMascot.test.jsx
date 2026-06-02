import { render } from '@testing-library/react'
import { PoussinMascot } from '../components/ui/PoussinMascot'

describe('PoussinMascot', () => {
  it('renderiza o SVG do mascote', () => {
    const { container } = render(<PoussinMascot />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('aplica o tamanho passado via prop', () => {
    const { container } = render(<PoussinMascot size={64} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '64')
    expect(svg).toHaveAttribute('height', '64')
  })

  it('adiciona animação quando animate=true', () => {
    const { container } = render(<PoussinMascot animate />)
    const svg = container.querySelector('svg')
    expect(svg?.style.animation).toContain('poussinBounce')
  })

  it('não anima por padrão', () => {
    const { container } = render(<PoussinMascot />)
    const svg = container.querySelector('svg')
    expect(svg?.style.animation).toBeFalsy()
  })
})
