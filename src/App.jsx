
import { useState } from 'react'
import './App.css'
import Materials from './Materials'

function App() {
  const [page, setPage] = useState('home')

  const goHome = () => {
    setPage('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goMaterials = () => {
    setPage('materials')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goHowItWorks = () => {
    setPage('home')

    setTimeout(() => {
      document.getElementById('how-it-works')?.scrollIntoView({
        behavior: 'smooth',
      })
    }, 100)
  }

  return (
    <div className="app">
      <nav className="navbar">
        <a
          href="#home"
          className="logo"
          onClick={(e) => {
            e.preventDefault()
            goHome()
          }}
        >
          <span className="logo-icon">♻</span>
          Reuse<span>Hub</span>
        </a>

        <div className="nav-links">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault()
              goHome()
            }}
          >
            Home
          </a>

          <a
            href="#materials-page"
            onClick={(e) => {
              e.preventDefault()
              goMaterials()
            }}
          >
            Find Materials
          </a>

          <a
            href="#how-it-works"
            onClick={(e) => {
              e.preventDefault()
              goHowItWorks()
            }}
          >
            How It Works
          </a>
        </div>

        <div className="nav-actions">
          <button
            className="login-btn"
            onClick={() => alert('Login feature will be added soon!')}
          >
            Login
          </button>

          <button className="primary-btn" onClick={goMaterials}>
            Get Started ↗
          </button>
        </div>
      </nav>

      {page === 'materials' ? (
        <Materials />
      ) : (
        <>
          <main>
            <section className="hero" id="home">
              <div className="hero-content">
                <div className="tag">
                  <span className="tag-dot"></span>
                  INDUSTRIAL WASTE. NEW POSSIBILITIES.
                </div>

                <h1>
                  Turn Waste Into
                  <br />
                  <span>Worth.</span> Build a
                  <br />
                  Better Future.
                </h1>

                <p className="hero-description">
                  Connect with industries that can give your
                  reusable waste a second life. Discover materials,
                  reduce waste, and build a more sustainable future.
                </p>

                <div className="hero-buttons">
                  <button
                    className="primary-btn large-btn"
                    onClick={goMaterials}
                  >
                    Explore Materials ↗
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={() =>
                      alert('Waste listing form will be added soon!')
                    }
                  >
                    + List Your Waste
                  </button>
                </div>

                <div className="hero-note">
                  <span>✓</span> Smarter reuse. Less waste. Better industry.
                </div>
              </div>

              <div className="hero-visual">
                <div className="visual-circle">
                  <div className="recycle-symbol">♻</div>
                  <span className="orbit orbit-one">METAL</span>
                  <span className="orbit orbit-two">PLASTIC</span>
                  <span className="orbit orbit-three">REUSE</span>
                </div>

                <div className="floating-card top-card">
                  <span className="mini-icon">↗</span>
                  <div>
                    <strong>Waste has value.</strong>
                    <p>Give materials a second life.</p>
                  </div>
                </div>

                <div className="floating-card bottom-card">
                  <span className="mini-icon">♻</span>
                  <div>
                    <strong>One connection at a time</strong>
                    <p>From waste to resource</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="materials-section" id="materials">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">EXPLORE MATERIALS</p>
                  <h2>Waste for one. Resource for another.</h2>
                </div>

                <p className="section-description">
                  Discover reusable industrial materials from different
                  categories.
                </p>
              </div>

              <div className="material-grid">
                <article className="material-card">
                  <div className="material-icon metal">⚙</div>
                  <h3>Metal Scrap</h3>
                  <p>
                    Aluminium, steel and other reusable metal materials.
                  </p>
                  <a href="#how-it-works">Explore category ↗</a>
                </article>

                <article className="material-card">
                  <div className="material-icon plastic">◈</div>
                  <h3>Plastic Waste</h3>
                  <p>
                    Reusable plastic materials for further processing.
                  </p>
                  <a href="#how-it-works">Explore category ↗</a>
                </article>

                <article className="material-card">
                  <div className="material-icon rubber">◉</div>
                  <h3>Rubber Waste</h3>
                  <p>
                    Industrial rubber leftovers with reuse potential.
                  </p>
                  <a href="#how-it-works">Explore category ↗</a>
                </article>

                <article className="material-card">
                  <div className="material-icon wood">▤</div>
                  <h3>Wood Waste</h3>
                  <p>
                    Reusable wood offcuts and manufacturing leftovers.
                  </p>
                  <a href="#how-it-works">Explore category ↗</a>
                </article>
              </div>

              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button className="primary-btn" onClick={goMaterials}>
                  View All Materials ↗
                </button>
              </div>
            </section>

            <section className="how-section" id="how-it-works">
              <p className="eyebrow">HOW REUSEHUB WORKS</p>
              <h2>A simple path from waste to reuse.</h2>

              <div className="steps-grid">
                <div className="step">
                  <span>01</span>
                  <h3>List Materials</h3>
                  <p>
                    Suppliers share the waste materials they have available.
                  </p>
                </div>

                <div className="step">
                  <span>02</span>
                  <h3>Find a Match</h3>
                  <p>
                    Buyers explore materials that fit their requirements.
                  </p>
                </div>

                <div className="step">
                  <span>03</span>
                  <h3>Connect</h3>
                  <p>
                    Interested companies can send requests to each other.
                  </p>
                </div>

                <div className="step">
                  <span>04</span>
                  <h3>Reuse</h3>
                  <p>
                    Give usable industrial materials another purpose.
                  </p>
                </div>
              </div>
            </section>
          </main>

          <footer className="footer">
            <a href="#home" className="logo" onClick={goHome}>
              <span className="logo-icon">♻</span>
              Reuse<span>Hub</span>
            </a>

            <p>
              Making industrial reuse easier, one connection at a time.
            </p>

            <span>Student Project · Frontend Prototype</span>
          </footer>
        </>
      )}
    </div>
  )
}

export default App
