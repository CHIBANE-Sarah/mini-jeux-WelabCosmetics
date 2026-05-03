<?php

// Namespace de l'entité dans le projet Symfony.
namespace App\Entity;

// Repository associé à cette entité.
use App\Repository\ParticipationRepository;

// ORM permet d'utiliser les attributs Doctrine pour mapper cette classe en table SQL.
use Doctrine\ORM\Mapping as ORM;

// Déclare cette classe comme entité Doctrine liée au ParticipationRepository.
#[ORM\Entity(repositoryClass: ParticipationRepository::class)]
class Participation
{
    // Identifiant unique de la participation en base de données.
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // Nom du joueur.
    #[ORM\Column(length: 100)]
    private ?string $joueurNom = null;

    // Prénom du joueur.
    #[ORM\Column(length: 100)]
    private ?string $joueurPrenom = null;

    // Score global du joueur, généralement sur 100.
    #[ORM\Column]
    private int $score = 0;

    // Durée totale de participation, en secondes.
    #[ORM\Column]
    private int $dureeSeconds = 0;

    // Date et heure de création de la participation.
    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    // Relation ManyToOne :
    // plusieurs participations peuvent appartenir à une même session.
    #[ORM\ManyToOne(inversedBy: 'participations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Session $session = null;

    // Constructeur appelé lors de la création d'une nouvelle participation.
    public function __construct()
    {
        // Initialise automatiquement la date de création.
        $this->createdAt = new \DateTimeImmutable();
    }

    // Retourne l'identifiant de la participation.
    public function getId(): ?int
    {
        return $this->id;
    }

    // Retourne le nom du joueur.
    public function getJoueurNom(): ?string
    {
        return $this->joueurNom;
    }

    // Définit le nom du joueur.
    public function setJoueurNom(string $joueurNom): static
    {
        $this->joueurNom = $joueurNom;
        return $this;
    }

    // Retourne le prénom du joueur.
    public function getJoueurPrenom(): ?string
    {
        return $this->joueurPrenom;
    }

    // Définit le prénom du joueur.
    public function setJoueurPrenom(string $joueurPrenom): static
    {
        $this->joueurPrenom = $joueurPrenom;
        return $this;
    }

    // Retourne le score global.
    public function getScore(): int
    {
        return $this->score;
    }

    // Définit le score global.
    public function setScore(int $score): static
    {
        $this->score = $score;
        return $this;
    }

    // Retourne la durée totale en secondes.
    public function getDureeSeconds(): int
    {
        return $this->dureeSeconds;
    }

    // Définit la durée totale en secondes.
    public function setDureeSeconds(int $dureeSeconds): static
    {
        $this->dureeSeconds = $dureeSeconds;
        return $this;
    }

    // Retourne la date de création.
    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    // Modifie la date de création.
    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    // Retourne la session liée à cette participation.
    public function getSession(): ?Session
    {
        return $this->session;
    }

    // Associe cette participation à une session.
    public function setSession(?Session $session): static
    {
        $this->session = $session;
        return $this;
    }
}