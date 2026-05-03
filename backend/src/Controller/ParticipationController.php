<?php

// Namespace du contrôleur dans l'application Symfony.
namespace App\Controller;

// Entité Participation utilisée pour créer et lire les participations.
use App\Entity\Participation;

// Repository permettant de retrouver une session à partir de son code.
use App\Repository\SessionRepository;

// EntityManager permet d'enregistrer les données en base.
use Doctrine\ORM\EntityManagerInterface;

// Classe de base des contrôleurs Symfony.
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

// Classes Symfony pour gérer les réponses JSON et les requêtes HTTP.
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

// Attribut Route pour déclarer les routes.
use Symfony\Component\Routing\Attribute\Route;

class ParticipationController extends AbstractController
{
    // Route POST /api/participation/save
    // Elle enregistre la participation finale d'un joueur.
    #[Route('/api/participation/save', name: 'participation_save', methods: ['POST'])]
    public function save(
        Request $request,
        SessionRepository $sessionRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        // Décode le JSON envoyé par Angular.
        $body = json_decode($request->getContent(), true);

        // Récupère les données envoyées, avec des valeurs par défaut si elles sont absentes.
        $sessionCode  = $body['sessionCode'] ?? null;
        $joueurNom    = $body['joueurNom'] ?? 'Inconnu';
        $joueurPrenom = $body['joueurPrenom'] ?? '';
        $score        = $body['scoreTotal'] ?? 0;
        $duree        = $body['tempsTotal'] ?? 0;

        // Recherche la session correspondant au code reçu.
        $session = $sessionRepository->findOneBy(['codeSession' => $sessionCode]);

        // Si la session n'existe pas, on retourne une erreur 404.
        if (!$session) {
            return $this->json(['error' => 'Session introuvable'], 404);
        }

        // Crée une nouvelle participation.
        $participation = new Participation();

        // Associe la participation à la session.
        $participation->setSession($session);

        // Enregistre les informations du joueur.
        $participation->setJoueurNom($joueurNom);
        $participation->setJoueurPrenom($joueurPrenom);

        // Enregistre le score global et la durée totale.
        $participation->setScore($score);
        $participation->setDureeSeconds($duree);

        // Prépare l'enregistrement en base.
        $em->persist($participation);

        // Exécute réellement l'insertion SQL.
        $em->flush();

        // Retourne une réponse de confirmation au frontend.
        return $this->json([
            'message'    => 'Participation enregistrée',
            'id'         => $participation->getId(),
            'scoreTotal' => $score,
        ], 201);
    }

    // Route GET /api/participation
    // Elle retourne la liste de toutes les participations enregistrées.
    #[Route('/api/participation', name: 'participation_list', methods: ['GET'])]
    public function getAll(
        EntityManagerInterface $em
    ): JsonResponse {
        // Récupère toutes les participations en base de données.
        $participations = $em->getRepository(Participation::class)->findAll();

        // Transforme chaque objet Participation en tableau simple pour le JSON.
        $data = array_map(function (Participation $p) {
            return [
                'id'           => $p->getId(),
                'sessionCode'  => $p->getSession()?->getCodeSession(),
                'sessionTitre' => $p->getSession()?->getTitreSession(),
                'userName'     => $p->getJoueurPrenom() . ' ' . $p->getJoueurNom(),
                'scoreTotal'   => $p->getScore(),
                'tempsTotal'   => $p->getDureeSeconds(),
                'createdAt'    => $p->getCreatedAt()?->format('d/m/Y H:i'),
            ];
        }, $participations);

        // Retourne la liste au frontend.
        return $this->json($data);
    }
}