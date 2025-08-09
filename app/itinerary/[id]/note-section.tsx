"use client"

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Note } from '@/types/Note'
import React from 'react'

const NoteSection = ({ notes }: { notes: Note[] }) => {
  return (
    <>
        <Accordion type="single" collapsible className="w-full">
            {notes.map((note) => (
                <AccordionItem value={note.id}>
                    <AccordionTrigger>{note.title}</AccordionTrigger>
                    <AccordionContent>{note.content}</AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    </>
  )
}

export default NoteSection