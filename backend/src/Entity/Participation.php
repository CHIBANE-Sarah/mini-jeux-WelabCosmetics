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

    #[ORM\Column(length: 100)]
    private ?string $joueurNom = null;

    #[ORM\Column(length: 100)]
    private ?string $joueurPrenom = null;

    #[ORM\Column]
    private int $score = 0;

    #[ORM\Column]
    private int $dureeSeconds = 0;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\ManyToOne(inversedBy: 'participations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Session $session = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getJoueurNom(): ?string
    {
        return $this->joueurNom;
    }

    public function setJoueurNom(string $joueurNom): static
    {
        $this->joueurNom = $joueurNom;
        return $this;
    }

    public function getJoueurPrenom(): ?string
    {
        return $this->joueurPrenom;
    }

    public function setJoueurPrenom(string $joueurPrenom): static
    {
        $this->joueurPrenom = $joueurPrenom;
        return $this;
    }

    public function getScore(): int
    {
        return $this->score;
    }

    public function setScore(int $score): static
    {
        $this->score = $score;
        return $this;
    }

    public function getDureeSeconds(): int
    {
        return $this->dureeSeconds;
    }

    public function setDureeSeconds(int $dureeSeconds): static
    {
        $this->dureeSeconds = $dureeSeconds;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getSession(): ?Session
    {
        return $this->session;
    }

    public function setSession(?Session $session): static
    {
        $this->session = $session;
        return $this;
    }
}