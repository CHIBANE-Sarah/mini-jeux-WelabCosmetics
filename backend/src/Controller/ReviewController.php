<?php

namespace App\Controller;

use App\Entity\Review;
use App\Repository\SessionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class ReviewController extends AbstractController
{
    #[Route('/api/reviews', name: 'review_create', methods: ['POST'])]
    public function create(
        Request $request,
        SessionRepository $sessionRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        $body = json_decode($request->getContent(), true);

        $note = (int)($body['note'] ?? 0);
        if ($note < 1 || $note > 5) {
            return $this->json(['error' => 'La note doit être comprise entre 1 et 5.'], 400);
        }

        $session = null;
        if (!empty($body['sessionCode'])) {
            $session = $sessionRepository->findOneBy([
                'codeSession' => strtoupper($body['sessionCode'])
            ]);
        }

        $review = new Review();
        $review->setSession($session);
        $review->setJoueurNom(trim($body['nom'] ?? 'Anonyme'));
        $review->setJoueurPrenom(trim($body['prenom'] ?? ''));
        $review->setAvatar($body['avatar'] ?? null);
        $review->setNote($note);
        $review->setCommentaire(trim($body['commentaire'] ?? ''));

        $em->persist($review);
        $em->flush();

        return $this->json([
            'message' => 'Avis enregistré',
            'id' => $review->getId(),
        ], 201);
    }

    #[Route('/api/reviews/latest', name: 'review_latest', methods: ['GET'])]
    public function latest(EntityManagerInterface $em): JsonResponse
    {
        $reviews = $em->getRepository(Review::class)->findBy(
            [],
            ['id' => 'DESC'],
            6
        );

        $data = array_map(function (Review $r) {
            return [
                'id' => $r->getId(),
                'sessionCode' => $r->getSession()?->getCodeSession(),
                'sessionTitre' => $r->getSession()?->getTitreSession(),
                'userName' => trim($r->getJoueurPrenom() . ' ' . $r->getJoueurNom()),
                'avatar' => $r->getAvatar(),
                'note' => $r->getNote(),
                'commentaire' => $r->getCommentaire(),
                'createdAt' => $r->getCreatedAt()?->format('d/m/Y H:i'),
            ];
        }, $reviews);

        return $this->json($data);
    }
}
