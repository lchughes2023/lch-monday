import { useState, useEffect, useCallback } from 'react'
import { scenarios } from '../data/scenarios'
import { rooms, roomOrder } from '../data/rooms'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getWrongOptions(correctId, count = 3) {
  const pool = roomOrder.filter((id) => id !== correctId)
  return shuffle(pool).slice(0, count)
}

function buildOptions(correctId) {
  const wrongs = getWrongOptions(correctId)
  return shuffle([correctId, ...wrongs])
}

export default function RouteGame({ progress, setProgress, addXP }) {
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(0)
  const [options, setOptions] = useState([])
  const [selected, setSelected] = useState(null)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionAttempts, setSessionAttempts] = useState(0)
  const [sessionXP, setSessionXP] = useState(0)
  const [done, setDone] = useState(false)

  const init = useCallback(() => {
    const shuffled = shuffle(scenarios)
    setQueue(shuffled)
    setIndex(0)
    setOptions(buildOptions(shuffled[0].correctRoom))
    setSelected(null)
    setSessionCorrect(0)
    setSessionAttempts(0)
    setSessionXP(0)
    setDone(false)
  }, [])

  useEffect(() => { init() }, [init])

  useEffect(() => {
    if (queue.length && index < queue.length) {
      setOptions(buildOptions(queue[index].correctRoom))
      setSelected(null)
    }
  }, [index, queue])

  if (!queue.length) return null

  const scenario = queue[index]
  const isAnswered = selected !== null
  const isCorrect = selected === scenario.correctRoom

  function handleSelect(roomId) {
    if (isAnswered) return
    setSelected(roomId)

    const correct = roomId === scenario.correctRoom
    const newAttempts = sessionAttempts + 1
    const newCorrect = correct ? sessionCorrect + 1 : sessionCorrect

    setSessionAttempts(newAttempts)
    if (correct) setSessionCorrect(newCorrect)

    setProgress((prev) => {
      const newTotal = prev.totalAttempts + 1
      const newTotalCorrect = prev.totalCorrect + (correct ? 1 : 0)
      const newStreak = correct ? prev.streak + 1 : 0
      const newBest = Math.max(prev.bestStreak, newStreak)

      const xpGain = correct ? (newStreak >= 3 ? 15 : 10) : 0
      if (correct) {
        addXP(xpGain)
        setSessionXP((x) => x + xpGain)
      }

      const achievements = [...prev.achievements]
      if (correct && !achievements.includes('first-correct')) achievements.push('first-correct')
      if (newTotalCorrect >= 5 && !achievements.includes('route-finder')) achievements.push('route-finder')
      if (newTotalCorrect >= 10 && !achievements.includes('archivist')) achievements.push('archivist')
      if (newStreak >= 5 && !achievements.includes('streak-hunter')) achievements.push('streak-hunter')

      return {
        ...prev,
        totalAttempts: newTotal,
        totalCorrect: newTotalCorrect,
        streak: newStreak,
        bestStreak: newBest,
        achievements,
      }
    })
  }

  function handleNext() {
    const nextIndex = index + 1
    if (nextIndex >= queue.length) {
      setDone(true)
      setProgress((prev) => {
        const achievements = [...prev.achievements]
        if (sessionCorrect === queue.length && !achievements.includes('perfect-round')) {
          achievements.push('perfect-round')
        }
        return { ...prev, achievements }
      })
    } else {
      setIndex(nextIndex)
    }
  }

  if (done) {
    const pct = Math.round((sessionCorrect / queue.length) * 100)
    return (
      <div className="route-game">
        <div className="game-complete animate-in">
          <div className="complete-emoji">
            {pct === 100 ? '🏆' : pct >= 80 ? '🌟' : pct >= 60 ? '👍' : '📚'}
          </div>
          <div className="complete-title">Round Complete!</div>
          <div className="complete-score">
            {sessionCorrect} / {queue.length} correct · {pct}% accuracy
          </div>
          <div className="complete-xp">+{sessionXP} XP earned</div>
          <div className="complete-actions">
            <button className="btn btn-primary" onClick={init}>
              Play Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const streakBonus = progress.streak >= 2 && isCorrect

  return (
    <div className="route-game">
      <div className="game-header">
        <div>
          <h2 className="section-title">🎮 Route-It</h2>
          <p className="section-subtitle">Where does this thought belong?</p>
        </div>
        <div className="game-score">
          <div className="score-pill">
            <strong>{sessionCorrect}</strong> / {sessionAttempts} correct
          </div>
          <div className="score-pill">🔥 {progress.streak}</div>
        </div>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((index + 1) / queue.length) * 100}%` }}
        />
      </div>

      <div className="scenario-card">
        <div className="scenario-num">Scenario {index + 1} of {queue.length}</div>
        <div className="scenario-prompt">"{scenario.prompt}"</div>
      </div>

      <div className="answer-grid">
        {options.map((roomId) => {
          const room = rooms[roomId]
          const isRight = roomId === scenario.correctRoom
          let cls = 'answer-btn'
          if (isAnswered) {
            if (roomId === selected && isRight) cls += ' correct'
            else if (roomId === selected && !isRight) cls += ' wrong'
            else if (isRight) cls += ' revealed'
          }
          return (
            <button
              key={roomId}
              className={cls}
              onClick={() => handleSelect(roomId)}
              disabled={isAnswered}
            >
              <span className="answer-emoji">{room.emoji}</span>
              <span>{room.name}</span>
            </button>
          )
        })}
      </div>

      {isAnswered && (
        <div className="feedback-box animate-in">
          <div className={`feedback-result ${isCorrect ? 'correct' : 'wrong'}`}>
            {isCorrect ? '✓ Correct!' : `✗ Not quite — ${rooms[scenario.correctRoom].emoji} ${rooms[scenario.correctRoom].name}`}
          </div>
          <div className="feedback-explanation">{scenario.explanation}</div>
          {isCorrect && (
            <div className="feedback-xp">
              +{streakBonus ? 15 : 10} XP{streakBonus ? ` · 🔥 Streak bonus! (×${progress.streak})` : ''}
            </div>
          )}
        </div>
      )}

      <div className="game-actions">
        {isAnswered && (
          <button className="btn btn-primary" onClick={handleNext}>
            {index + 1 < queue.length ? 'Next →' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  )
}
