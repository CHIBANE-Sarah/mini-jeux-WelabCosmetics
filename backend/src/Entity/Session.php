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

    #[ORM\OneToMany(
        targetEntity: Game::class,
        mappedBy: 'session',
        cascade: ['persist', 'remove']
    )]
    private Collection $games;

    /**
     * @var Collection<int, Participation>
     */
    #[ORM\OneToMany(
        mappedBy: 'session',
        targetEntity: Participation::class,
        orphanRemoval: true,
        cascade: ['persist']
    )]
    private Collection $participations;

    public function __construct()
    {
        $this->games = new ArrayCollection();
        $this->participations = new ArrayCollection();
    }

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

    public function getGames(): Collection
    {
        return $this->games;
    }

    public function addGame(Game $game): static
    {
        if (!$this->games->contains($game)) {
            $this->games->add($game);
            $game->setSession($this);
        }
        return $this;
    }

    public function removeGame(Game $game): static
    {
        if ($this->games->removeElement($game)) {
            if ($game->getSession() === $this) {
                $game->setSession(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Participation>
     */
    public function getParticipations(): Collection
    {
        return $this->participations;
    }

    public function addParticipation(Participation $participation): static
    {
        if (!$this->participations->contains($participation)) {
            $this->participations->add($participation);
            $participation->setSession($this);
        }
        return $this;
    }

    public function removeParticipation(Participation $participation): static
    {
        if ($this->participations->removeElement($participation)) {
            if ($participation->getSession() === $this) {
                $participation->setSession(null);
            }
        }
        return $this;
    }
}