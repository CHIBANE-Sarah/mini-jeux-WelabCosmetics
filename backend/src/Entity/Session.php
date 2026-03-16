<?php

namespace App\Entity;

use App\Repository\SessionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SessionRepository::class)]
class Session
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $titreSession = null;

    #[ORM\Column(length: 50)]
    private ?string $codeSession = null;

    #[ORM\Column]
    private ?int $duree = null;

    #[ORM\ManyToOne(inversedBy: 'sessionsCrees')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $createur = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitreSession(): ?string
    {
        return $this->titreSession;
    }

    public function setTitreSession(string $titreSession): static
    {
        $this->titreSession = $titreSession;

        return $this;
    }

    public function getCodeSession(): ?string
    {
        return $this->codeSession;
    }

    public function setCodeSession(string $codeSession): static
    {
        $this->codeSession = $codeSession;

        return $this;
    }

    public function getDuree(): ?int
    {
        return $this->duree;
    }

    public function setDuree(int $duree): static
    {
        $this->duree = $duree;

        return $this;
    }

    public function getCreateur(): ?User
    {
        return $this->createur;
    }

    public function setCreateur(?User $createur): static
    {
        $this->createur = $createur;

        return $this;
    }


}
