'use client';

import { Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from '@heroui/react';
import { motion } from 'framer-motion';
import type { RecommendationType } from '@/types';

interface InsightCardProps {
  type: RecommendationType;
  title: string;
  summary: string;
  details?: string;
  tips?: string[];
  index?: number;
}

const TYPE_CONFIG: Record<RecommendationType, { icon: string; color: string }> = {
  training: { icon: '\u{1F3CB}\uFE0F', color: 'text-primary' },
  nutrition: { icon: '\u{1F96C}', color: 'text-success' },
  recovery: { icon: '\u{1F9D8}', color: 'text-secondary' },
};

export function InsightCard({
  type,
  title,
  summary,
  details,
  tips,
  index = 0,
}: InsightCardProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const config = TYPE_CONFIG[type];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 + index * 0.1, ease: 'easeOut' }}
      >
        <Card
          isPressable
          onPress={onOpen}
          className="w-full border border-divider hover:border-primary/30 transition-colors"
        >
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0" role="img" aria-label={type}>
                {config.icon}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className={`text-sm font-semibold ${config.color} capitalize`}>
                  {type}
                </h3>
                <p className="text-sm font-medium mt-0.5 truncate">{title}</p>
                <p className="text-xs text-foreground/60 mt-1 line-clamp-2">
                  {summary}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" size="sm">
        <ModalContent className="bg-white dark:bg-zinc-900">
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2">
                <span className="text-xl">{config.icon}</span>
                <span className="capitalize">{type}: {title}</span>
              </ModalHeader>
              <ModalBody>
                <p className="text-sm text-foreground/80">
                  {details || summary}
                </p>
                {tips && tips.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-2">
                      Tips
                    </p>
                    <ul className="space-y-1.5">
                      {tips.map((tip, i) => (
                        <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                          <span className="text-primary mt-0.5 shrink-0">&#8226;</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Got it
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
