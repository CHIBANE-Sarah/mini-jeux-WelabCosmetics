<?php

namespace App\Entity;

use App\Repository\ParticipationRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ParticipationRepository::class)]
class Participation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Session::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Session $session = null;

    #[ORM\Column(nullable: true)]
    private ?int $scoreTotal = null;

    #[ORM\Column(nullable: true)]
    private ?int $tempsTotal = null;

    public function getId(): ?int { return $this->id; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }

    public function getSession(): ?Session { return $this->session; }
    public function setSession(?Session $session): static { $this->session = $session; return $this; }

    public function getScoreTotal(): ?int { return $this->scoreTotal; }
    public function setScoreTotal(?int $scoreTotal): static { $this->scoreTotal = $scoreTotal; return $this; }

    public function getTempsTotal(): ?int { return $this->tempsTotal; }
    public function setTempsTotal(?int $tempsTotal): static { $this->tempsTotal = $tempsTotal; return $this; }
}