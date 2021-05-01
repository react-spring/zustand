import React from 'react'
import { cleanup, render } from '@testing-library/react'
import { StateCreator } from '../src/index'
import createContext from '../src/context'

const consoleError = console.error
afterEach(() => {
  cleanup()
  console.error = consoleError
})

type CounterState = {
  count: number
  inc: () => void
}

it('creates and uses context store', async () => {
  const { Provider, useStore } = createContext<CounterState>()

  const createParam: StateCreator<CounterState> = (set) => ({
    count: 0,
    inc: () => set((state) => ({ count: state.count + 1 })),
  })

  function Counter() {
    const { count, inc } = useStore()
    React.useEffect(inc, [inc])
    return <div>count: {count}</div>
  }

  const { findByText } = render(
    <Provider createState={createParam}>
      <Counter />
    </Provider>
  )

  await findByText('count: 1')
})

it('throws error when not using provider', async () => {
  console.error = jest.fn()

  class ErrorBoundary extends React.Component<{}, { hasError: boolean }> {
    constructor(props: {}) {
      super(props)
      this.state = { hasError: false }
    }
    static getDerivedStateFromError() {
      return { hasError: true }
    }
    render() {
      return this.state.hasError ? <div>errored</div> : this.props.children
    }
  }

  const { useStore } = createContext<CounterState>()
  function Component() {
    useStore()
    return <div>no error</div>
  }

  const { findByText } = render(
    <ErrorBoundary>
      <Component />
    </ErrorBoundary>
  )
  await findByText('errored')
})