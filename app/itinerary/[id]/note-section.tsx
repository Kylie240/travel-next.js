"use client"

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Note } from '@/types/Note'
import React from 'react'

const NoteSection = ({ notes }: { notes: Note[] }) => {
  return (
    <>
        <Accordion type="single" collapsible className="w-full">
            {notes.map((note, index) => (
                <AccordionItem key={note.id} value={note.id.toString()} style={{borderBottom: index !== notes.length - 1 ? "1px solid lightgray" : ""}}>
                    <AccordionTrigger>{note.title}</AccordionTrigger>
                    <AccordionContent>{note.content}</AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    </>
  )
}

export default NoteSection