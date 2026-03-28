<?php

namespace App\Entity;

use App\Repository\CrosswordQuestionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CrosswordQuestionRepository::class)]
class CrosswordQuestion
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $definition = null;

    #[ORM\Column(length: 100)]
    private ?string $motCorrect = null;

    #[ORM\ManyToOne(targetEntity: Session::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Session $session = null;

    public function getId(): ?int { return $this->id; }

    public function getDefinition(): ?string { return $this->definition; }
    public function setDefinition(string $definition): static { $this->definition = $definition; return $this; }

    public function getMotCorrect(): ?string { return $this->motCorrect; }
    public function setMotCorrect(string $motCorrect): static { $this->motCorrect = $motCorrect; return $this; }

    public function getSession(): ?Session { return $this->session; }
    public function setSession(?Session $session): static { $this->session = $session; return $this; }
}