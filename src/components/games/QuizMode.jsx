import { useState, useEffect, useCallback } from 'react'
import { usePalace } from '../../contexts/PalaceContext'
import { useProgress } from '../../contexts/ProgressContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildChoices(correctRoom, allRooms) {
  const wrongs = shuffle(
    allRooms.filter((r) => r.id !== correctRoom.id && r.theme)
  ).slice(0, 3)
  return shuffle([correctRoom.theme, ...wrongs.map((r) => r.theme)])
}

export default function QuizMode() {
  const { rooms } = usePalace()
  const { progress, setProgress, addXP } = useProgress()

  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(0)
  const [choices, setChoices] = useState([])
  const [selected, setSelected] = useState(null)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionAttempts, setSessionAttempts] = useState(0)
  const [sessionXP, setSessionXP] = useState(0)
  const [done, setDone] = useState(false)

  // Only rooms with a theme field are quiz-able
  const quizRooms = rooms.filter((r) => r.theme)

  const init = useCallback(() => {
    if (quizRooms.length < 4) return
    const shuffled = shuffle(quizRooms)
    setQueue(shuffled)
    setIndex(0)
    setChoices(buildChoices(shuffled[0], quizRooms))
    setSelected(null)
    setSessionCorrect(0)
    setSessionAttempts(0)
    setSessionXP(0)
    setDone(false)
  }, [quizRooms]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { init() }, [init])

  useEffect(() => {
    if (queue.length && index < queue.length) {
      setChoices(buildChoices(queue[index], quizRooms))
      setSelected(null)
    }
  }, [index, queue]) // eslint-disable-line react-hooks/exhaustive-deps

  if (quizRooms.length < 4) {
    return (
      <div className="quiz-mode">
        <h2 className="section-title">🧠 Quiz Mode</h2>
        <p className="section-subtitle">You need at least 4 rooms with a cognitive theme set to play. Add themes in the Builder tab.</p>
      </div>
    )
  }

  if (!queue.length) return null

  const room = queue[index]
  const correctTheme = room.theme
  const isAnswered = selected !== null
  const isCorrect = selected === correctTheme

  function handleSelect(theme) {
    if (isAnswered) return
    setSelected(theme)

    const correct = theme === correctTheme
    setSessionAttempts((n) => n + 1)
    if (correct) {
      setSessionCorrect((n) => n + 1)
      addXP(8)
      setSessionXP((x) => x + 8)
    }

    setProgress((prev) => {
      const achievements = [...prev.achievements]
      const newTotalCorrect = prev.totalCorrect + (correct ? 1 : 0)
      if (newTotalCorrect >= 5 && !achievements.includes('route-finder')) achievements.push('route-finder')
      if (newTotalCorrect >= 10 && !achievements.includes('archivist')) achievements.push('archivist')
      return { ...prev, totalCorrect: newTotalCorrect, totalAttempts: prev.totalAttempts + 1, achievements }
    })
  }

  function handleNext() {
    const nextIndex = index + 1
    if (nextIndex >= queue.length) {
      setDone(true)
    } else {
      setIndex(nextIndex)
    }
  }

  if (done) {
    const pct = Math.round((sessionCorrect / queue.length) * 100)
    return (
      <div className="quiz-mode">
        <div className="game-complete animate-in">
          <div className="complete-emoji">
            {pct === 100 ? '🎓' : pct >= 75 ? '🌟' : '📖'}
          </div>
          <div className="complete-title">Quiz Complete!</div>
          <div className="complete-score">
            {sessionCorrect} / {queue.length} correct · {pct}%
          </div>
          <div className="complete-xp">+{sessionXP} XP earned</div>
          <div className="complete-actions">
            <button className="btn btn-primary" onClick={init}>Try Again</button>
          </div>
        </div>
      </div>
    )
  }

  const letters = ['A', 'B', 'C', 'D']

  return (
    <div className="quiz-mode">
      <div className="game-header">
        <div>
          <h2 className="section-title">🧠 Quiz Mode</h2>
          <p className="section-subtitle">What does this room store?</p>
        </div>
        <div className="game-score">
          <div className="score-pill">
            <strong>{sessionCorrect}</strong> / {sessionAttempts} correct
          </div>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${((index + 1) / queue.length) * 100}%` }} />
      </div>

      <div className="quiz-card">
        <div className="quiz-room-emoji">{room.emoji}</div>
        <div className="quiz-room-name">{room.name}</div>
        <div className="quiz-question">Question {index + 1} of {queue.length} — what is this room's cognitive function?</div>
      </div>

      <div className="quiz-choices">
        {choices.map((theme, i) => {
          const isRight = theme === correctTheme
          let cls = 'quiz-choice'
          if (isAnswered) {
            if (theme === selected && isRight) cls += ' correct'
            else if (theme === selected && !isRight) cls += ' wrong'
            else if (isRight) cls += ' revealed'
          }
          return (
            <button
              key={theme}
              className={cls}
              onClick={() => handleSelect(theme)}
              disabled={isAnswered}
            >
              <span className="choice-letter">{letters[i]}</span>
              <span>{theme}</span>
            </button>
          )
        })}
      </div>

      {isAnswered && (
        <div className="feedback-box animate-in">
          <div className={`feedback-result ${isCorrect ? 'correct' : 'wrong'}`}>
            {isCorrect ? `✓ Correct! This is the ${room.name}.` : `✗ The answer was "${correctTheme}"`}
          </div>
          <div className="feedback-explanation">{room.description}</div>
          {isCorrect && <div className="feedback-xp">+8 XP</div>}
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
