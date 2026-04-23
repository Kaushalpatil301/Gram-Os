import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const initialQA = [
  {
    id: "q1",
    question: "How to store tomatoes to increase shelf life?",
    answers: [
      { id: "a1", text: "Keep them at room temperature and avoid sunlight.", helpful: 4 },
      { id: "a2", text: "Do not refrigerate unless fully ripe.", helpful: 2 },
    ],
  },
]

export default function QnASection() {
  const [qa, setQa] = useState(initialQA)
  const [qText, setQText] = useState("")
  const [aText, setAText] = useState({})

  const ask = () => {
    if (!qText.trim()) return
    setQa((prev) => [{ id: crypto.randomUUID(), question: qText.trim(), answers: [] }, ...prev])
    setQText("")
  }

  const answer = (qid) => {
    const text = (aText[qid] || "").trim()
    if (!text) return
    setQa((prev) =>
      prev.map((q) =>
        q.id === qid ? { ...q, answers: [...q.answers, { id: crypto.randomUUID(), text, helpful: 0 }] } : q
      )
    )
    setAText((m) => ({ ...m, [qid]: "" }))
  }

  const markHelpful = (qid, aid) => {
    setQa((prev) =>
      prev.map((q) =>
        q.id === qid
          ? { ...q, answers: q.answers.map((a) => (a.id === aid ? { ...a, helpful: a.helpful + 1 } : a)) }
          : q
      )
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Queries & QnA</h2>
      <p className="text-muted-foreground">Ask questions, share answers, and mark helpful tips.</p>

      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-1 bg-background/60 backdrop-blur">
          <CardHeader>
            <CardTitle>Ask a Question</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Textarea
              placeholder="Type your question..."
              value={qText}
              onChange={(e) => setQText(e.target.value)}
            />
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={ask}>
              Ask
            </Button>
          </CardContent>
        </Card>

        <div className="md:col-span-2 grid gap-4">
          {qa.map((q) => (
            <Card key={q.id} className="bg-background/60 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-base">{q.question}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid gap-2">
                  {q.answers.length ? (
                    q.answers.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-start justify-between gap-4 border rounded-md p-3"
                        role="group"
                        aria-label="Answer item"
                      >
                        <p className="text-sm">{a.text}</p>
                        <Button size="sm" variant="outline" onClick={() => markHelpful(q.id, a.id)}>
                          Helpful ({a.helpful})
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No answers yet.</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Write an answer..."
                    value={aText[q.id] || ""}
                    onChange={(e) => {
                      const v = e.target.value
                      setAText((m) => ({ ...m, [q.id]: v }))
                    }}
                  />
                  <Button size="sm" onClick={() => answer(q.id)}>
                    Answer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
