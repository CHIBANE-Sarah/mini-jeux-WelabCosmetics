<?php

// Namespace de l'entité dans le projet Symfony.
namespace App\Entity;

// Repository associé à l'entité Session.
use App\Repository\SessionRepository;

// Classes Doctrine utilisées pour gérer des collections d'objets liés.
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

// ORM permet d'utiliser les attributs Doctrine pour mapper la classe en table SQL.
use Doctrine\ORM\Mapping as ORM;

// Indique que cette classe est une entité Doctrine liée au SessionRepository.
#[ORM\Entity(repositoryClass: SessionRepository::class)]
class Session
{
    // Identifiant unique de la session en base de données.
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // Titre de la session, par exemple "Session test".
    #[ORM\Column(length: 100)]
    private ?string $titreSession = null;

    // Code de session utilisé par les joueurs pour rejoindre la session.
    #[ORM\Column(length: 50)]
    private ?string $codeSession = null;

    // Durée totale de la session, exprimée en secondes dans le projet.
    #[ORM\Column]
    private ?int $duree = null;

    // Relation ManyToOne :
    // plusieurs sessions peuvent être créées par un même utilisateur.
    #[ORM\ManyToOne(inversedBy: 'sessionsCrees')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $createur = null;

    // Relation OneToMany :
    // une session peut contenir plusieurs jeux.
    // cascade persist/remove permet d'enregistrer ou supprimer les jeux liés avec la session.
    #[ORM\OneToMany(
        targetEntity: Game::class,
        mappedBy: 'session',
        cascade: ['persist', 'remove']
    )]
    private Collection $games;

    /**
     * Relation OneToMany :
     * une session peut avoir plusieurs participations.
     * orphanRemoval supprime les participations qui ne sont plus liées à une session.
     *
     * @var Collection<int, Participation>
     */
    #[ORM\OneToMany(
        mappedBy: 'session',
        targetEntity: Participation::class,
        orphanRemoval: true,
        cascade: ['persist']
    )]
    private Collection $participations;

    // Constructeur appelé quand un objet Session est créé.
    public function __construct()
    {
        // Initialise les collections pour éviter les erreurs quand on ajoute des jeux ou participations.
        $this->games = new ArrayCollection();
        $this->participations = new ArrayCollection();
    }

    // Retourne l'identifiant technique de la session.
    public function getId(): ?int
    {
        return $this->id;
    }

    // Retourne le titre de la session.
    public function getTitreSession(): ?string
    {
        return $this->titreSession;
    }

    // Modifie le titre de la session.
    public function setTitreSession(string $titreSession): static
    {
        $this->titreSession = $titreSession;
        return $this;
    }

    // Retourne le code de la session.
    public function getCodeSession(): ?string
    {
        return $this->codeSession;
    }

    // Modifie le code de la session.
    public function setCodeSession(string $codeSession): static
    {
        $this->codeSession = $codeSession;
        return $this;
    }

    // Retourne la durée de la session.
    public function getDuree(): ?int
    {
        return $this->duree;
    }

    // Modifie la durée de la session.
    public function setDuree(int $duree): static
    {
        $this->duree = $duree;
        return $this;
    }

    // Retourne l'utilisateur qui a créé la session.
    public function getCreateur(): ?User
    {
        return $this->createur;
    }

    // Définit l'utilisateur créateur de la session.
    public function setCreateur(?User $createur): static
    {
        $this->createur = $createur;
        return $this;
    }

    // Retourne la collection des jeux liés à cette session.
    public function getGames(): Collection
    {
        return $this->games;
    }

    // Ajoute un jeu à la session.
    public function addGame(Game $game): static
    {
        // Évite d'ajouter deux fois le même jeu.
        if (!$this->games->contains($game)) {
            $this->games->add($game);

            // Met aussi à jour le côté propriétaire de la relation.
            $game->setSession($this);
        }

        return $this;
    }

    // Retire un jeu de la session.
    public function removeGame(Game $game): static
    {
        if ($this->games->removeElement($game)) {
            // Si le jeu pointe encore vers cette session, on retire le lien.
            if ($game->getSession() === $this) {
                $game->setSession(null);
            }
        }

        return $this;
    }

    /**
     * Retourne toutes les participations liées à cette session.
     *
     * @return Collection<int, Participation>
     */
    public function getParticipations(): Collection
    {
        return $this->participations;
    }

    // Ajoute une participation à la session.
    public function addParticipation(Participation $participation): static
    {
        // Évite d'ajouter deux fois la même participation.
        if (!$this->participations->contains($participation)) {
            $this->participations->add($participation);

            // Met aussi à jour le côté propriétaire de la relation.
            $participation->setSession($this);
        }

        return $this;
    }

    // Retire une participation de la session.
    public function removeParticipation(Participation $participation): static
    {
        if ($this->participations->removeElement($participation)) {
            // Si la participation pointe encore vers cette session, on retire le lien.
            if ($participation->getSession() === $this) {
                $participation->setSession(null);
            }
        }

        return $this;
    }
}